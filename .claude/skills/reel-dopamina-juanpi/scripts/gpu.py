# Whisper en la placa de video si se puede (GTX 1660 Ti de Juanpi): las DLL de cuBLAS y
# cuDNN vienen de los paquetes de pip nvidia-cublas-cu12 / nvidia-cudnn-cu12. Si una PC
# no los tiene (o no tiene placa NVIDIA), vuelve a la CPU como antes.
import os, site
from faster_whisper import WhisperModel

for _p in site.getsitepackages():
    for _sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        _d = os.path.join(_p, *_sub.split("/"))
        if os.path.isdir(_d):
            os.add_dll_directory(_d)
            os.environ["PATH"] = _d + os.pathsep + os.environ.get("PATH", "")


def modelo(nombre):
    try:
        return WhisperModel(nombre, device="cuda", compute_type="float16")
    except Exception as e:
        print("(Whisper en CPU:", str(e)[:80], ")")
        return WhisperModel(nombre, device="cpu", compute_type="int8", cpu_threads=8)
