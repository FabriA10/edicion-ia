# ¿La música tapa? Whisper sobre la entrega sin música (v5) y con música (v6):
# si lee lo mismo, no tapa (audio.md). Y el tema solo, en el tramo que se usa:
# si devuelve palabras, tiene material en la banda del habla.
import difflib, os, re, subprocess, tempfile
from faster_whisper import WhisperModel
R = "F:/edicion con ia/proyectos/04-dos-camaras/"
m = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=6)
tmp = os.path.join(tempfile.gettempdir(), "wm.wav")

def texto(src, extra=()):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *extra, "-i", src, "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", tmp], check=True)
    segs, _ = m.transcribe(tmp, language="es", temperature=0, condition_on_previous_text=False, vad_filter=False)
    return " ".join(s.text.strip() for s in segs)

palabras = lambda t: re.sub(r"[^\wáéíóúñü ]", " ", t.lower()).split()
a = texto(R + "out/doscam-01-v5-final.mp4")
b = texto(R + "out/doscam-01-v6-final.mp4")
print("SIN música:", a, "\n")
print("CON música:", b, "\n")
pa, pb = palabras(a), palabras(b)
dif = [d for d in difflib.ndiff(pa, pb) if d[0] in "+-"]
print(f"palabras: {len(pa)} sin música, {len(pb)} con música; diferencias: {dif if dif else 'ninguna'}\n")

