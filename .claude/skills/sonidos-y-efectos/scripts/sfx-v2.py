# Los sonidos de la vuelta 2, en una pista aparte que la pasada de cierre suma
# DESPUÉS del limitador de la voz (así la ganancia de la voz no los arrastra).
#
#   - el scratch de Isaias (trabajo/p1/scratch-isaias-48k.wav, el primero de los
#     dos que trae su archivo) donde termina "anuncios"
#   - la voz en off de ElevenLabs, si se pasa (python sfx-v2.py vo.wav): va en
#     el hueco que él dejó (7,12-9,29 s del corte)
#   - los subtítulos animados: whoosh cuando la letra se posa y golpecito por
#     palabra en los Delayed Up slide (lo de sfx4c.py, aprobado en el 4c)
#   - la zona: un pop por tarjeta que entra, y un tic en los mecanismos que
#     cambian (la dona, el contador, la balanza, el botón de seguir)
#   - el hook: el mensaje de la voz en off, el estallido del collage
#   - los dos motion graphics: la entrada, el neón que se prende, el anillo que
#     vuela a la tarjeta; el tecleo de GUÍA, publicar, el viaje de cámara, la A,
#     la Z
#
# Todo sintetizado, como en el 4c. Sale trabajo/extras-v2.wav (48 kHz mono, del
# largo exacto del corte) y una copia en public/ para oírlo en el Studio.
import io, json, math, re, subprocess, sys, wave
from types import SimpleNamespace
import numpy as np
from scipy import signal

RAIZ = "F:/edicion con ia/proyectos/08-collage-columna-izquierda/"
VO = sys.argv[1] if len(sys.argv) > 1 else None
SR, FPS = 48000, 30
rng = np.random.default_rng(2909)
db = lambda x: 10 ** (x / 20)
cuadro = lambda t: int(math.floor(t * FPS + 0.5))
redondo = lambda x: int(math.floor(x + 0.5))   # Math.round de JS

# ── tiempos: los mismos del código de la composición ─────────────────────────
tiempos_ts = io.open(RAIZ + "src/v2/tiempos.ts", encoding="utf-8").read()
bloque_T = re.search(r"export const T = \{([\s\S]*?)\} as const;", tiempos_ts).group(1)
T = SimpleNamespace(**{k: float(v) for k, v in re.findall(r"(\w+):\s*([\d.]+)", bloque_T)})
SCRATCH = float(re.search(r"export const SCRATCH = ([\d.]+);", tiempos_ts).group(1))
VOZ_EN_OFF = tuple(float(x) for x in re.search(r"VOZ_EN_OFF = \{ desde: ([\d.]+), hasta: ([\d.]+) \}", tiempos_ts).groups())
HOOK_FIN = int(re.search(r"export const HOOK_FIN = (\d+);", tiempos_ts).group(1))
ESTALLIDO = HOOK_FIN - 9
MG1 = tuple(int(x) for x in re.search(r"MG1 = \{ desde: (\d+), hasta: (\d+) \}", tiempos_ts).groups())
_mg2 = re.search(r"MG2 = \{ desde: cuadro\(([\d.]+)\), hasta: (\d+) \}", tiempos_ts).groups()
MG2 = (cuadro(float(_mg2[0])), int(_mg2[1]))
FIN = int(re.search(r"fin: (\d+)", tiempos_ts).group(1))
N = FIN * (SR // FPS)

zona_ts = io.open(RAIZ + "src/v2/Zona.tsx", encoding="utf-8").read()
momentos = re.findall(r"\{ desde: ([^,]+), hasta: ([^,]+), glifo: (\w+)", zona_ts.split("export const MOMENTOS")[1].split("= [", 1)[1])
ev = lambda expr: float(eval(expr, {"T": T}))
ENTRADAS = [(cuadro(ev(a)), g) for a, _, g in momentos]

cues_ts = io.open(RAIZ + "src/v2/subtitulos-v2.ts", encoding="utf-8").read()
CUES = json.loads(re.search(r"export const CUES: CueV2\[\] = (\[[\s\S]*\]);", cues_ts).group(1))
ANIMADOS = [c for c in CUES if c.get("animacion")]

# ── los sonidos ──────────────────────────────────────────────────────────────
def barrido(dur, f0, f1, pico, grave=0.0):
    """Ruido con un pasabanda que barre de f0 a f1: el whoosh del 4c."""
    n = int(dur * SR)
    ruido = rng.standard_normal(n)
    salida = np.zeros(n); zi = None
    for k in range(0, n, 256):
        p = k / n
        fc = f0 * (f1 / f0) ** p
        sos = signal.butter(2, [fc / 1.6, min(fc * 1.6, SR / 2 - 100)], btype="bandpass", fs=SR, output="sos")
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        salida[k:k + 256], zi = signal.sosfilt(sos, ruido[k:k + 256], zi=zi)
    t = np.arange(n) / SR
    env = np.where(t < dur * 0.72, (t / (dur * 0.72)) ** 2.2, np.exp(-(t - dur * 0.72) / 0.035))
    salida *= env
    if grave:
        salida += grave * np.sin(2 * np.pi * np.cumsum(60 + 40 * t / dur) / SR) * env
    return salida / np.abs(salida).max() * db(pico)

def pop(dur=0.09, f0=1100, pico=-21):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (0.5 + 0.5 * np.exp(-t / 0.045))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.028)
    x += rng.standard_normal(n) * np.exp(-t / 0.002) * 0.35
    return x / np.abs(x).max() * db(pico)

def burbuja(pico=-23):
    """El pop de las tarjetas: más redondo que el de los subtítulos, sube de tono."""
    n = int(0.11 * SR); t = np.arange(n) / SR
    f = 380 + 520 * (1 - np.exp(-t / 0.018))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035) * np.minimum(1, t / 0.002)
    return x / np.abs(x).max() * db(pico)

def tic(pico=-27, fc=3200):
    n = int(0.03 * SR); t = np.arange(n) / SR
    x = signal.sosfilt(signal.butter(2, [fc / 1.8, fc * 1.8], "bandpass", fs=SR, output="sos"), rng.standard_normal(n))
    x *= np.exp(-t / 0.006)
    x += 0.5 * np.sin(2 * np.pi * fc * 0.5 * t) * np.exp(-t / 0.01)
    return x / np.abs(x).max() * db(pico)

def tecla(pico=-24):
    """Una tecla de celular: clic seco y un cuerpo corto."""
    n = int(0.05 * SR); t = np.arange(n) / SR
    clic = signal.sosfilt(signal.butter(2, [1800, 6500], "bandpass", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.004)
    cuerpo = np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.012) * 0.6
    x = clic + cuerpo
    return x / np.abs(x).max() * db(pico)

def mensaje(pico=-22):
    """El aviso de un mensaje: dos notas cortas que suben."""
    partes = []
    for f, d in ((880, 0.07), (1320, 0.12)):
        n = int(d * SR); t = np.arange(n) / SR
        x = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / 0.004) * np.exp(-t / (d * 0.5))
        partes.append(x)
    x = np.concatenate([partes[0], np.zeros(int(0.015 * SR)), partes[1]])
    return x / np.abs(x).max() * db(pico)

def golpe(pico=-13):
    """El golpe grave del corte a la parte 2."""
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 42 + 70 * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16) * np.minimum(1, t / 0.003)
    x += 0.3 * signal.sosfilt(signal.butter(2, 900, "lowpass", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.03)
    return x / np.abs(x).max() * db(pico)

def neon(pico=-25):
    """Un tubo que se prende: zumbido que parpadea dos veces y queda."""
    n = int(0.2 * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * 100 * k * t) / k for k in (1, 2, 3, 5, 7))
    x += 0.3 * signal.sosfilt(signal.butter(2, [2000, 6000], "bandpass", fs=SR, output="sos"), rng.standard_normal(n))
    patron = [0, 0.9, 0.18, 1, 0.5, 1]
    env = np.array([patron[min(int(tt * FPS), len(patron) - 1)] for tt in t])
    env = np.convolve(env, np.ones(96) / 96, "same") * np.exp(-np.maximum(0, t - 0.12) / 0.04)
    x *= env
    return x / np.abs(x).max() * db(pico)

def brillo(pico=-28):
    """Destellos agudos para los corazones."""
    n = int(0.45 * SR); x = np.zeros(n)
    for k in range(9):
        i = int(rng.uniform(0, 0.3) * SR); m = int(0.08 * SR)
        f = rng.uniform(2400, 5200); t = np.arange(m) / SR
        s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.02) * np.minimum(1, t / 0.002)
        x[i:i + m] += s[: max(0, min(m, n - i))]
    return x / np.abs(x).max() * db(pico)

pista = np.zeros(N)
def pone(x, t):
    i = int(round(t * SR))
    if i < 0: x, i = x[-i:], 0
    j = min(N, i + len(x)); pista[i:j] += x[: j - i]
def pone_cuadro(x, f, antes=0.0):
    pone(x, f / FPS - antes)

# ── el scratch y la voz en off (lo de sfx.py) ────────────────────────────────
def leer(ruta):
    w = wave.open(ruta); sr = w.getframerate(); ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
    if ch > 1: x = x.reshape(-1, ch).mean(1)
    if sr != SR:
        g = math.gcd(SR, sr); x = signal.resample_poly(x, SR // g, sr // g)
    return x

def escribir(ruta, x):
    o = wave.open(ruta, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()); o.close()

def medir(x, momentaneo=False):
    tmp = RAIZ + "trabajo/_medir.wav"
    escribir(tmp, np.concatenate([np.zeros(SR // 2), x, np.zeros(SR // 2)]))
    s = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", tmp, "-af", "ebur128" + ("" if momentaneo else "=framelog=quiet"), "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    if momentaneo:
        return max(float(l.split(" M:")[1].split()[0]) for l in s.splitlines() if " M:" in l and "TARGET" in l)
    return float(s.split("Integrated loudness:")[1].split("I:")[1].split("LUFS")[0])

sc = leer(RAIZ + "trabajo/p1/scratch-isaias-48k.wav")
SC = sc[int(1.550 * SR): int(1.915 * SR)].copy()
n = int(0.003 * SR); SC[:n] *= np.linspace(0, 1, n); SC[-n:] *= np.linspace(1, 0, n)
SC *= db(-15 - medir(SC, momentaneo=True))
pone(SC, SCRATCH)

def limitar(x, ganancia_db, techo=0.7):
    tmp_i, tmp_o = RAIZ + "trabajo/_vo_in.wav", RAIZ + "trabajo/_vo_out.wav"
    escribir(tmp_i, x)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", tmp_i, "-af",
                    f"volume={ganancia_db:.2f}dB,alimiter=limit={techo}:attack=5:release=60:level=false,"
                    "atrim=start_sample=240,asetpts=N/SR/TB", "-c:a", "pcm_s16le", tmp_o], check=True)
    return leer(tmp_o)

# (30/09) "que calcule justo el timing… en el silencio, para que entre cuando
# estoy diciendo la respuesta de 'bueno, está bien'". La voz arranca apenas
# termina el scratch y la última palabra cae 0,12 s antes del "bueno" (9,29):
# una respuesta que llega enseguida, sin pisarla. Si el habla no entra en ese
# tramo, se aprieta con atempo (hasta 1,2x; la de Lina, de 2,32 s, pide ~1,08x,
# que no se nota). Se mide sobre el habla, no sobre el archivo: ElevenLabs deja
# aire al principio y al final.
if VO:
    vo = leer(VO)
    e = 20 * np.log10(np.sqrt(np.convolve(vo ** 2, np.ones(480) / 480, "same")) + 1e-9)
    voz_i = np.argmax(e > -40); voz_f = np.nonzero(e > -40)[0][-1]
    antes, despues = int(0.02 * SR), int(0.06 * SR)
    vo = vo[max(0, voz_i - antes): voz_f + despues]
    habla = (voz_f - voz_i) / SR
    inicio = SCRATCH + len(SC) / SR + 0.005          # apenas termina el scratch
    fin_max = VOZ_EN_OFF[1] - 0.12                   # 0,12 s de aire antes del "bueno"
    cabe = fin_max - inicio
    factor = 1.0
    if habla > cabe:
        factor = min(1.2, habla / cabe)
        tmp_i, tmp_o = RAIZ + "trabajo/_vo_in.wav", RAIZ + "trabajo/_vo_at.wav"
        escribir(tmp_i, vo)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", tmp_i, "-af", f"atempo={factor:.4f}", "-c:a", "pcm_s16le", tmp_o], check=True)
        vo = leer(tmp_o)
    vo = vo * db(-6 - 20 * np.log10(np.abs(vo).max()))
    for _ in range(4):
        g = -16 - medir(limitar(vo, 0))
        if abs(g) < 0.2: break
        vo = limitar(vo, g)
    pone(vo, inicio - antes / SR / factor)
    fin_vo = inicio + habla / factor
    print(f"voz en off: habla {habla:.2f} s, tramo {cabe:.2f} s -> atempo {factor:.3f}; "
          f"de {inicio:.3f} a {fin_vo:.3f} s del corte; aire hasta el 'bueno' ({VOZ_EN_OFF[1]:.2f}): {VOZ_EN_OFF[1] - fin_vo:.2f} s")
    if fin_vo > VOZ_EN_OFF[1] - 0.05:
        print("  OJO: la voz en off pisa el 'bueno, está bien'")
else:
    print(f"sin voz en off: el hueco va de {VOZ_EN_OFF[0]:.2f} a {VOZ_EN_OFF[1]:.2f}")

# ── los subtítulos animados (sfx4c.py) ───────────────────────────────────────
W_ = barrido(0.30, 450, 4200, -17)
for c in ANIMADOS:
    pone(W_, c["desde"] + 4 / FPS - 0.30 * 0.72)
    if c["animacion"] == "delayed-up-slide":
        for tw in c.get("palabras", []):
            pone(pop(), tw - 2 / FPS + 3 / FPS)
    else:
        pone(pop(f0=900), c["desde"] + 5 / FPS)

# ── la zona ──────────────────────────────────────────────────────────────────
B_ = burbuja()
for f, g in ENTRADAS:
    pone_cuadro(B_, f + 1)
TIC = tic()
for t in (T.treinta1, T.cuarenta, T.treinta2):   # la dona: cada porción
    pone(TIC, t - 2 / FPS)
for t in (T.dos, T.cuatro, T.diario):            # el contador salta
    pone(tic(-25, 2600), t - 3 / FPS)
pone(tic(-25, 1800), T.calidad - 2 / FPS + 0.1)  # la balanza se inclina
pone(tecla(-22), T.seguinos - 2 / FPS)           # el dedo toca "seguir"
pone(mensaje(-26), T.seguinos + 0.05)            # y queda "siguiendo"

# ── el hook ──────────────────────────────────────────────────────────────────
if not VO:                                              # el globo, sin voz: un aviso de mensaje
    pone_cuadro(mensaje(), cuadro(VOZ_EN_OFF[0]) - 7)
EST = barrido(0.42, 250, 3600, -15, grave=0.6)          # el collage estalla
pone_cuadro(EST, HOOK_FIN, antes=0.42 * 0.72)
pone_cuadro(golpe(), HOOK_FIN)

# ── motion graphic 1 ─────────────────────────────────────────────────────────
ENTRA_MG = barrido(0.30, 300, 3800, -17, grave=0.3)
pone_cuadro(ENTRA_MG, MG1[0] + 4, antes=0.30 * 0.72)
local1 = lambda t: redondo(t * FPS) - MG1[0]
for i in range(3):
    pone_cuadro(neon(), MG1[0] + local1(T.tres) + i * 4)
pone_cuadro(barrido(0.30, 3800, 700, -19), MG1[1] - 10)   # el anillo vuela a la tarjeta
pone_cuadro(pop(f0=1500, pico=-24), MG1[1] - 1)

# ── motion graphic 2 ─────────────────────────────────────────────────────────
pone_cuadro(ENTRA_MG, MG2[0] + 4, antes=0.30 * 0.72)
local2 = lambda t: redondo(t * FPS) - MG2[0]
for i in range(4):
    pone_cuadro(tecla(), MG2[0] + local2(T.guia) - 1 + i * 2)
publica = MG2[0] + local2(T.guia) + 12
pone_cuadro(pop(f0=1250, pico=-20), publica)
pone_cuadro(brillo(), publica + 2)
viaje = MG2[0] + local2(53.1)
pone_cuadro(barrido(0.55, 350, 2800, -19), viaje + 2)
pone_cuadro(golpe(-24), viaje + 17)                       # el manual se asienta
pone_cuadro(barrido(0.22, 900, 4000, -24), MG2[0] + local2(54.23) - 3)   # la flecha
pone_cuadro(neon(-23), MG2[0] + local2(55.87) - 1)        # la A
pone_cuadro(neon(-23), MG2[0] + local2(T.z) - 1)          # la Z
pone_cuadro(pop(f0=1300, pico=-24), MG2[0] + local2(T.instagram) - 2)

pico = np.abs(pista).max()
print(f"{len(ANIMADOS)} subtítulos animados, {len(ENTRADAS)} tarjetas; pico de la pista {20 * np.log10(pico):.1f} dBFS")
escribir(RAIZ + "trabajo/extras-v2.wav", pista)
escribir(RAIZ + "public/extras-v2.wav", pista)
print(f"extras-v2.wav: {N} muestras = {N / SR:.3f} s")
for f, g in ENTRADAS:
    print(f"  tarjeta {f / FPS:6.2f}  {g}")
