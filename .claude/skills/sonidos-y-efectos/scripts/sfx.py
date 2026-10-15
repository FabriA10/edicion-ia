# Pista de efectos (trabajo/sfx/extras.wav, 48 kHz estéreo, del largo del video): cada efecto sale de
# Desktop/Sound effects (o se sintetiza: timbre, zumbido, campanita), se normaliza por su RMS activo y se
# pone en su cuadro con una ganancia relativa. Los momentos salen de src/anim/voz.ts (M) y los cortes de
# escena con la misma regla que src/anim/guion.ts (antes(k, n) = round(M[k]) - n).
#   python sfx.py
import json, os, re, subprocess, wave
import numpy as np

R = "F:/edicion con ia/proyectos/11-animacion-2d-personajes"
SFX = "F:/edicion con ia/sonidos"
SR = 48000
FPS = 30
src = open(f"{R}/src/anim/voz.ts", encoding="utf-8").read()
TOTAL = int(re.search(r"TOTAL = (\d+)", src).group(1))
M = json.loads(re.search(r"export const M = (\{.*?\}) as const", src, re.S).group(1))


def antes(k, n=3):
    return round(M[k]) - n


def t(fr):
    return fr / FPS


cache = {}


def carga(nombre, desde=0.0, dur=None):
    clave = (nombre, desde, dur)
    if clave in cache:
        return cache[clave]
    args = ["ffmpeg", "-v", "error", "-ss", str(desde)] + (["-t", str(dur)] if dur else []) + ["-i", f"{SFX}/{nombre}", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
    # normaliza por el RMS de la parte activa (ventanas de 20 ms por encima de -50 dB)
    v = x.mean(1)
    n = len(v) // 960
    r = np.sqrt((v[: n * 960].reshape(n, 960) ** 2).mean(1)) if n else np.array([1e-9])
    act = r[r > 10 ** (-50 / 20)]
    rms = np.sqrt((act ** 2).mean()) if len(act) else 1e-9
    x *= 10 ** (-20 / 20) / rms
    if dur:  # fundido corto al final si se recortó
        nf = min(len(x), int(0.04 * SR))
        x[-nf:] *= np.linspace(1, 0, nf)[:, None]
    cache[clave] = x
    return x


def norm(y):
    y = y / (np.sqrt((y ** 2).mean()) + 1e-9) * 10 ** (-20 / 20)
    return np.stack([y, y], 1).astype(np.float32)


def tono(f0, dur, decae=6.0, armonicos=((1, 1), (2, 0.4), (3, 0.15))):
    tt = np.arange(int(dur * SR)) / SR
    y = sum(a * np.sin(2 * np.pi * f0 * k * tt) for k, a in armonicos) * np.exp(-decae * tt)
    return norm(y * np.minimum(1, tt / 0.004))


def zumbido(dur):  # vibración del celular
    tt = np.arange(int(dur * SR)) / SR
    y = np.sign(np.sin(2 * np.pi * 165 * tt)) * 0.6 + np.sin(2 * np.pi * 330 * tt) * 0.3
    return norm(y * np.minimum(1, tt / 0.01) * np.minimum(1, (dur - tt) / 0.02))


def timbre(dur):  # ring ring: dos tonos alternados a 20 Hz, en ráfagas
    tt = np.arange(int(dur * SR)) / SR
    alt = np.floor(tt * 20) % 2
    y = np.where(alt > 0, np.sin(2 * np.pi * 1320 * tt), np.sin(2 * np.pi * 1660 * tt)) * 0.7
    rafaga = ((tt % 1.0) < 0.42).astype(float)
    y = y * rafaga * np.minimum(1, tt / 0.01)
    y = y / (np.sqrt((y[rafaga > 0] ** 2).mean()) + 1e-9) * 10 ** (-20 / 20)
    return np.stack([y, y], 1).astype(np.float32)


N = int(np.ceil(TOTAL / FPS * SR)) + SR
pista = np.zeros((N, 2), np.float32)
log = []


def pon(x, seg, db, nombre=""):
    i = int(round(seg * SR))
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(N, i + len(x))
    pista[i:j] += x[: j - i] * 10 ** (db / 20)
    log.append((round(seg, 3), nombre, db))


def WH():
    return carga("Whoosh4.mp3")


def SW():
    return carga("Sweep .mp3")


def POP():
    return carga("Pop up 4.mp3")


def POP2():
    return carga("Pop-Up.mp3")


def POP5():
    return carga("Pop up 5.wav")


def BLOOP():
    return carga("Bloop 1.mp3")


def OK():
    return carga("Correct Sound.mp3", 0, 1.0)


def NO():
    return carga("Negative Error.wav")


def DING():
    return tono(1760, 1.2, 4.5, ((1, 1), (2.76, 0.35), (5.4, 0.12)))


GRILLOS = "Crickets (Awkward Silence) - Sound Effect (HD).mp4"

# --- transiciones (el whoosh llega al medio del corte)
for k, n, tipo in [("celular", 6, "zoom"), ("deLucia", 9, "barrido"), ("martinSube", 3, "barrido"), ("losVe", 4, "zoom"), ("recibe", 3, "barrido"),
                   ("enCambio", 3, "subida"), ("pasan", 3, "barrido"), ("unDia", 3, "iris"), ("empezo", 3, "zoom"), ("leEmp", 3, "barrido"),
                   ("martin6", 3, "barrido"), ("unaBio", 3, "zoom"), ("ahi", 3, "barrido"), ("elAnuncio", 3, "subida"), ("martin8", 3, "iris"),
                   ("conEso", 3, "barrido"), ("estaVez", 3, "subida"), ("resultado", 6, "zoom"), ("esaSemana", 3, "barrido")]:
    s = t(antes(k, n))
    if tipo in ("barrido", "subida"):
        pon(SW(), s - 0.32, -9, f"barrido {k}")
    elif tipo == "zoom":
        pon(WH(), s - 0.30, -8, f"zoom {k}")
    else:
        pon(carga("Appearance 1.mp3", 0, 1.5), s - 0.15, -12, f"iris {k}")

# --- acto 1
pon(POP(), t(M["martin"]), -8, "etiqueta Martín")
pon(POP(), t(M["lucia"]), -8, "etiqueta Lucía")
pon(carga("Stretch.mp3", 0, 1.2), t(M["telaranas"] - 4), -14, "telaraña")
pon(BLOOP(), t(M["telaranas"] + 8), -10, "araña")
ini = M["suena"] - 6
paso = max(5, (M["turno"] - ini) / 7)
for i in range(7):
    pon(POP5(), t(ini + i * paso), -11 - (i % 2), "notificación")
def rafagas(desde, hasta, db):
    # el zumbido al compás de las ráfagas del dibujo (Celular.tsx: prendido 10 cuadros de cada 24)
    k = int(np.ceil(desde / 24.0) * 24)
    while k < hasta:
        pon(zumbido(0.32), t(k), db, "vibra")
        k += 24


rafagas(ini, M["turno"] + 20, -20)
pon(POP(), t(M["odontologos"] - 2), -9, "diente")
pon(carga("Cam shutter 2.mp3", 0, 0.8), t(M["graban"] - 6), -12, "aro de luz")
pon(POP2(), t(M["que"] + 2), -7, "signo")

# --- acto 2
pon(carga("Click 1.mp3"), t(M["sube"] - 2), -10, "compartir")
pon(OK(), t(M["perfil1"] + 3), -10, "publicado")
pon(carga("Clock 1.mp3", 0, 1.6), t(M["espera"] - 8), -14, "reloj")
pon(carga("Counter.wav", 0, 2.6), t(antes("losVe", 4)), -16, "contador")
for k2, d in [("muchisima", 0), ("muchisima", 3), ("muchisima", 6), ("gente1", 0), ("gente1", 3), ("gente1", 6), ("cualquier", 0), ("cualquier", 4), ("lado", -2), ("lado", 2)]:
    pon(BLOOP(), t(M[k2] + d), -15, "pin")
for i in range(6):
    pon(POP(), t(M["like"] - 4 + i * (M["pero1"] - M["like"]) / 6), -17, "corazón")
pon(POP2(), t(M["lindo"] - 8), -9, "comentario")
pon(carga(GRILLOS, 0.3, 2.0), t(M["nadie"] - 2), -13, "grillos")
pon(WH(), t(M["usa"] - 6), -12, "tarjeta")
pon(carga("Drop.aac"), t(M["anuncios1"] - 4), -10, "sello")
pon(carga("Appearance 1.mp3", 0, 1.2), t(M["anuncios1"] + 4), -14, "megáfono")
pon(carga("Scan.aac"), t(M["personas3"] - 6), -14, "radio")
pon(POP(), t(M["ciudad1"] - 4), -10, "su ciudad")
for i in range(6):
    pon(carga("Paper in Air.aac", 0, 0.45), t(M["pasan"] + i * (M["canso"] - M["pasan"]) / 6), -15, "hoja")
pon(carga("Sad Trumpet.mp3"), t(M["canso"] - 2), -9, "trompeta triste")
pon(POP2(), t(M["mala"] - 10), -11, "pensamiento")
pon(POP(), t(M["gente4"] - 4), -12, "otro pensamiento")

# --- acto 3
pon(POP2(), t(M["decidio"] - 2), -8, "¡listo!")
pon(carga("Typing 1.mp3", 0, 2.2), t(M["probar"] - 4), -14, "tipeo rápido")
pon(carga("Mouse click.mp3"), t(M["publico"] - 2), -8, "publicar")
pon(OK(), t(M["publico"] + 6), -10, "publicado")
ini = M["llegar"] - 6
paso = max(4, (M["mismo"] - ini) / 7)
for i in range(7):
    pon(POP5(), t(ini + i * paso), -12, "mensaje")
rafagas(ini, M["mismo"], -23)
pon(POP2(), t(M["cuanto"] - 3), -8, "¿cuánto sale?")
pon(POP2(), t(M["cual"] - 3), -8, "¿precio?")
pon(carga("Cash register 1.mp3", 0, 1.4), t(M["cual"] + 4), -12, "caja")
ini = M["desaparecian"] - 4
for i in range(7):
    pon(POP(), t(ini + i * 3 + 2), -16, "puf")
pon(NO(), t(M["desaparecian"] + 6), -12, "error")
pon(carga(GRILLOS, 0.3, 1.6), t(M["desaparecian"] + 14), -14, "grillos")
for k2, d in [("entiende", -4), ("entiende", 0), ("nada", -2)]:
    pon(POP(), t(M[k2] + d), -12, "?")
pon(carga("Appearance 1.mp3", 0, 1.0), t(M["alguien"] - 4), -12, "disfraz")
for k2 in ("biografia", "destacadas", "trabajo"):
    pon(carga("Marker.mp3", 0, 0.9), t(M[k2]), -12, "marcador")
for i in range(9):
    pon(carga("Tick.mp3"), t(M["tampoco"] + i * 2), -10, "cruz")

# --- acto 4
pon(DING(), t(M["justo"] - 2), -12, "bombilla")
pon(carga("Click 1.mp3"), t(M["entra"] - 2), -9, "toca el perfil")
pon(carga("Stone motion.aac", 0, 1.0), t(M["confia"] - 4), -16, "balanza")
pon(OK(), t(M["confia"] - 4), -12, "confía")
pon(NO(), t(M["oNo"] - 4), -12, "o no")
pon(POP(), t(M["elAnuncio"] - 2), -10, "llega")
pon(POP2(), t(M["quede"] - 4), -9, "se queda")
pon(carga("Riser 1.wav", 1.2, 2.0), t(antes("martin8", 3)) - 2.0, -18, "subida")
pon(carga("Flicker.aac", 0, 1.2), t(M["impecable"] - 4), -16, "brillos")
for k2, d in [("destacadas8", 12), ("despues8", 10), ("biografia8", 14)]:
    pon(OK(), t(M[k2] + d), -12, "check perfil")
pon(POP2(), t(M["importante"] - 6), -9, "!")
pon(carga("Typing 1.mp3", 3.0, 2.0), t(M["redactar"] - 2), -15, "redacta")
pon(carga("Paper in Air.aac", 0, 0.8), t(M["peroEsta"] - 2), -11, "bollo")
pon(carga("Drop.aac"), t(M["peroEsta"] + 15), -12, "al tacho")
pon(DING(), t(M["pensandolo"] - 2), -12, "idea")
pon(WH(), t(antes("estaVez", 3)), -15, "fila 1")
pon(WH(), t(M["grabacion"] - 8), -15, "fila 2")
pon(WH(), t(M["dirigida"] - 8), -15, "fila 3")
for k2 in ("claro", "cuidada", "ciudad10"):
    pon(OK(), t(M[k2] - 2), -10, "check")

# --- acto 5
pon(carga("Clap.wav", 0, 2.2), t(M["excelente"] - 4), -11, "aplausos")
c1 = M["personas11"] - 8
c2 = M["agendar"] - 8
c3 = M["interesada"] - 10
paso = max(6, (c2 - c1 - 10) / 4)
for i in range(4):
    pon(POP5(), t(c1 + 4 + i * paso), -11, "consulta")
for i in range(10):
    pon(carga("Click 1.mp3"), t(c2 + 4 + i * (c3 - c2 - 8) / 10), -15, "turno en la agenda")
pon(timbre(2.6), t(M["suena12"] - 4), -12, "suena el celular")
rafagas(M["suena12"] - 4, M["suena12"] + 80, -19)
pon(carga("Deep whoosh 2.mp3", 0, 1.4), t(M["telaranas12"] - 4), -11, "se vuelan las telarañas")
pon(POP2(), t(M["pasado"] - 6), -10, "chau telarañas")
pon(carga("Hook sound effects/Deep Woosh.wav", 0, 2.0), t(M["rendirse"] - 4), -16, "se apaga")
pon(carga("Bass Drop.aac", 0, 2.6), t(M["todo"] - 2), -5, "todo")

pista = pista[: int(np.ceil(TOTAL / FPS * SR))]
pico = np.abs(pista).max()
print(f"{len(log)} efectos, pico {20 * np.log10(pico + 1e-9):.1f} dBFS")
os.makedirs(f"{R}/trabajo/sfx", exist_ok=True)
w = wave.open(f"{R}/trabajo/sfx/extras.wav", "wb")
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes((np.clip(pista, -1, 1) * 32767).astype("<i2").tobytes())
w.close()
json.dump(sorted(log), open(f"{R}/trabajo/sfx/efectos.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
