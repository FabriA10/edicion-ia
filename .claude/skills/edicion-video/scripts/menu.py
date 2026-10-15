# Transcribe CADA pasada por separado y arma el menú del que salen los cortes.
#
# Corre después de scripts/pasadas.mjs, sobre el pasadas.json que deja al lado
# del wav. Sobre el archivo entero Whisper funde las repeticiones y corre los
# tiempos hasta 0,3 s; sobre el recorte exacto de una pasada los clava, y de paso
# el texto que sale ya es el del bloque que vas a elegir.
#
#   node scripts/pasadas.mjs trabajo/vNN/mic16.wav
#   python scripts/menu.py trabajo/vNN/mic16.wav [modelo]
#
# El menú se lee buscando el CAMBIO DE TEMA: la última pasada de una tanda es la
# que va, y se reconoce porque la siguiente ya habla de otra cosa. Ver
# `references/cortes.md`, "el menú de pasadas".
import json, os, subprocess, sys, tempfile
from faster_whisper import WhisperModel

WAV = sys.argv[1]
MODELO = sys.argv[2] if len(sys.argv) > 2 else "small"
PASADAS = os.path.join(os.path.dirname(WAV), "pasadas.json")
SALIDA = os.path.join(os.path.dirname(WAV), "menu.json")

tomas = json.load(open(PASADAS, encoding="utf-8"))
m = WhisperModel(MODELO, device="cpu", compute_type="int8", cpu_threads=6)
out = []
for i, (a, b) in enumerate(tomas):
    tmp = os.path.join(tempfile.gettempdir(), "pasada.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(a), "-to", str(b), "-i", WAV,
                    "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", tmp], check=True)
    segs, _ = m.transcribe(tmp, language="es", temperature=0,
                           compression_ratio_threshold=None, condition_on_previous_text=False)
    txt = " ".join(s.text.strip() for s in segs).strip()
    out.append({"n": i, "i": a, "f": b, "t": txt})
    print(f"{i:3}  {a:7.2f}-{b:7.2f} ({b-a:5.2f}s)  {txt}", flush=True)
json.dump(out, open(SALIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("### FIN ###", len(out), "pasadas ->", SALIDA)
