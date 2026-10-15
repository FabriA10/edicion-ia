# El susto de la vuelta 3 (30/09), cuadro por cuadro, fuera de Remotion.
#
# Pedido (con dos capturas de referencia: una cara oscura, verdosa, estirada, con los ojos como dos puntitos de luz; y otra
# en blanco y negro puro, a umbral): "algo más así que dé miedo, estirame la cara y hacé que se tuerza, y que el scream sea
# más repentino, que no le dé tiempo a la audiencia a esperarlo".
#
# Lo que hace, sobre los cuadros del precorte (él con la linterna, el búh y la boca abierta):
#   - en el cuadro del búh, sin nada antes que lo anuncie, salta a un primerísimo plano de la cara;
#   - la cara se ESTIRA hacia abajo (la mandíbula y la boca abierta se alargan, la frente apenas) y se angosta, y se
#     TUERCE en remolino alrededor de la nariz; las dos cosas crecen mientras dura el grito;
#   - dos looks que se alternan: ESPECTRO (el de la primera referencia: casi negro, verde grisáceo, grano, ojos que brillan
#     como dos puntos) y UMBRAL (la segunda: blanco y negro a 1 bit). Como mucho 3 destellos de umbral por segundo;
#   - sacudida de cámara, un poco de fantasma del cuadro anterior y una rotura final en franjas antes de "perdón".
#
#   python susto3.py [prueba k1 k2 ...]   -> public/susto-v3.mp4 (los cuadros desde el búh hasta "perdón por asustarte")
#   con "prueba", sólo escribe esos cuadros como PNG en trabajo/susto3/ para mirarlos.
import json, math, os, re, subprocess, sys
import numpy as np
import cv2

RAIZ = "F:/edicion con ia/proyectos/10-gancho-susto-tarjetas/"
FUENTE = RAIZ + "public/precorte-v3.mp4"
SAL_DIR = RAIZ + "trabajo/susto3/"
os.makedirs(SAL_DIR, exist_ok=True)
T = open(RAIZ + "src/v3/tiempos.ts", encoding="utf-8").read()
GOLPE = int(re.search(r"GOLPE = (\d+)", T).group(1))
SUSTO_FIN = int(re.search(r"SUSTO_FIN = (\d+)", T).group(1))
N = SUSTO_FIN - GOLPE
W, H = 1080, 1920

def leer_cuadros(desde, cuantos):
    cru = subprocess.run(["ffmpeg", "-v", "error", "-i", FUENTE, "-vf", f"select='between(n\\,{desde}\\,{desde + cuantos - 1})'",
                          "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(cru, np.uint8).reshape(-1, H, W, 3)

# ── seguimiento de la cara ───────────────────────────────────────────────────
# En el cuadro del búh (medido a mano): pupilas en (520, 749) y (623, 749), punta de la nariz (570, 810), boca (568, 872).
OJO_I, OJO_D, NARIZ, BOCA = np.array([520., 749.]), np.array([623., 749.]), np.array([570., 810.]), np.array([568., 872.])

def seguir(cuadros):
    """Corrimiento de la cara en cada cuadro respecto del primero (plantilla de ojos y nariz, búsqueda de ±60 px)."""
    g0 = cv2.cvtColor(cuadros[0], cv2.COLOR_BGR2GRAY)
    x0, y0, x1, y1 = 460, 700, 690, 840
    tpl = g0[y0:y1, x0:x1]
    out = []
    for c in cuadros:
        g = cv2.cvtColor(c, cv2.COLOR_BGR2GRAY)
        m = 60
        zona = g[y0 - m:y1 + m, x0 - m:x1 + m]
        r = cv2.matchTemplate(zona, tpl, cv2.TM_CCOEFF_NORMED)
        _, _, _, (bx, by) = cv2.minMaxLoc(r)
        out.append(np.array([bx - m, by - m], float))
    # un suavizado corto: la plantilla salta un píxel de más de vez en cuando
    a = np.array(out)
    k = np.array([0.25, 0.5, 0.25])
    for j in range(2):
        p = np.pad(a[:, j], 1, mode="edge")
        a[:, j] = np.convolve(p, k, "valid")
    return a

# ── la deformación ───────────────────────────────────────────────────────────
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def mapa(centro, ojos, boca, zoom, estira, angosta, giro, sac, bulbo_ojo, bulbo_boca, tuerce=0.0, destino=(540., 790.)):
    """Mapa hacia atrás: para cada píxel de salida, de qué punto del cuadro fuente se toma.
    centro: la nariz (fuente); todo se arma en coordenadas relativas a ella.
    giro: el remolino alrededor de la nariz (radianes en el centro, se apaga suave hasta Rt).
    tuerce: cuánto se va la mandíbula hacia un costado (px de la fuente a la altura del mentón)."""
    dx, dy, rot = sac
    u = xx - destino[0] - dx
    v = yy - destino[1] - dy
    c, s = math.cos(-rot), math.sin(-rot)
    u, v = c * u - s * v, s * u + c * v
    # zoom
    u = u / zoom
    v = v / zoom
    # estiramiento: la parte de abajo de la cara (desde los ojos) se alarga, la de arriba apenas; la cara se angosta.
    # Pesa según la distancia a la cara, así el fondo no se deforma tanto como ella. Es el primer paso de este mapa
    # hacia atrás, o sea lo ÚLTIMO que le pasa a la cara: se estira la cara ya torcida.
    y_ojos = float(np.mean([o[1] for o in ojos]) - centro[1])        # negativo: los ojos están arriba de la nariz
    peso = np.exp(-((u / 300.0) ** 2 + ((v - 60) / 520.0) ** 2))
    abajo = v > y_ojos
    fac_v = np.where(abajo, 1 + (estira - 1) * peso, 1 + (estira - 1) * 0.2 * peso)
    v = y_ojos + (v - y_ojos) / fac_v
    u = u / (1 + (angosta - 1) * peso)
    # la mandíbula se tuerce hacia un costado: corrimiento que crece desde la nariz hacia abajo
    baja = np.clip(v / 120.0, 0, 1.6)
    u = u - tuerce * baja ** 1.6 * np.exp(-(u / 240.0) ** 2)
    # remolino suave: gira más cerca de la nariz y se apaga en Rt, sin llegar a borrar los rasgos
    Rt = 430.0
    r = np.sqrt(u * u + v * v)
    fi = giro * np.clip(1 - r / Rt, 0, 1) ** 2
    cf, sf = np.cos(-fi), np.sin(-fi)
    u, v = cf * u - sf * v, sf * u + cf * v
    # ojos y boca que se agrandan (hacia atrás: se junta hacia su centro)
    for o, b, rr in [(ojos[0], bulbo_ojo, 34.0), (ojos[1], bulbo_ojo, 34.0), (boca, bulbo_boca, 58.0)]:
        ox, oy = o[0] - centro[0], o[1] - centro[1]
        du, dv = u - ox, v - oy
        g = np.exp(-(du * du + dv * dv) / (2 * rr * rr))
        f = 1 - b * g
        u, v = ox + du * f, oy + dv * f
    return (u + centro[0]).astype(np.float32), (v + centro[1]).astype(np.float32)

def deformar(img, mx, my):
    return cv2.remap(img, mx, my, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

# ── los looks ────────────────────────────────────────────────────────────────
rng = np.random.default_rng(3009)

def luminancia(img):
    f = img.astype(np.float32) / 255
    return 0.114 * f[..., 0] + 0.587 * f[..., 1] + 0.299 * f[..., 2]

VIÑETA = None
def vineta():
    global VIÑETA
    if VIÑETA is None:
        d = np.sqrt(((xx - 540) / 620) ** 2 + ((yy - 900) / 900) ** 2)
        VIÑETA = np.clip(1.15 - d ** 1.6, 0, 1).astype(np.float32)
    return VIÑETA

def espectro(img, ojos_sal, zoom, fantasma=None):
    """La primera referencia: casi negro, verde grisáceo, con grano y los ojos como dos puntos de luz."""
    L = luminancia(img)
    L = cv2.GaussianBlur(L, (0, 0), 1.6)
    L = np.clip((L - 0.07) / 0.78, 0, 1) ** 1.55 * 0.62
    L *= vineta()
    # grano grueso (no por píxel: a 1080 el grano fino no se ve en el celular)
    ruido = cv2.resize(rng.standard_normal((H // 3, W // 3)).astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR)
    L = np.clip(L + 0.045 * ruido, 0, 1)
    if fantasma is not None:
        L = np.maximum(L, 0.55 * fantasma)
    # ojos: las cuencas se hunden en negro y en el medio queda un punto blanco con halo (la primera referencia)
    brillo = np.zeros_like(L)
    for ox, oy in ojos_sal:
        d2 = (xx - ox) ** 2 + (yy - oy) ** 2
        cuenca = 20 * zoom ** 0.9
        L *= 1 - 0.85 * np.exp(-d2 / (2 * cuenca ** 2))
        nucleo = 3.2 * zoom ** 0.5
        brillo += np.exp(-d2 / (2 * nucleo ** 2)) * 1.0 + np.exp(-d2 / (2 * (nucleo * 5) ** 2)) * 0.35
    tinte = np.array([0.66, 0.80, 0.70], np.float32)            # B, G, R: verde grisáceo
    rgb = L[..., None] * tinte[None, None, :] + np.array([0.012, 0.022, 0.016], np.float32)
    rgb = rgb + brillo[..., None] * np.array([0.92, 1.0, 0.9], np.float32)
    return np.clip(rgb * 255, 0, 255).astype(np.uint8), L

def umbral(img, invertido=False, corte=0.40):
    """La segunda referencia: la cara a 1 bit, blanco sobre negro."""
    L = luminancia(img)
    L = cv2.GaussianBlur(L, (0, 0), 2.2)
    b = (L > corte).astype(np.float32)
    # bordes un poco mordidos, como un fotocopiado
    ruido = cv2.resize(rng.standard_normal((H // 6, W // 6)).astype(np.float32), (W, H))
    b = ((L + 0.03 * ruido) > corte).astype(np.float32)
    if invertido:
        b = 1 - b
    return np.clip(np.repeat(b[..., None], 3, 2) * 255, 0, 255).astype(np.uint8)

def partir_rgb(img, dx):
    if abs(dx) < 0.5:
        return img
    out = img.copy()
    M1 = np.float32([[1, 0, dx], [0, 1, 0]])
    M2 = np.float32([[1, 0, -dx], [0, 1, 0]])
    out[..., 2] = cv2.warpAffine(img[..., 2], M1, (W, H), borderMode=cv2.BORDER_REFLECT)
    out[..., 0] = cv2.warpAffine(img[..., 0], M2, (W, H), borderMode=cv2.BORDER_REFLECT)
    return out

def franjas(img, k, fuerza):
    """La rotura del final: franjas horizontales corridas."""
    out = img.copy()
    r = np.random.default_rng(900 + k)
    y = 0
    while y < H:
        alto = int(r.integers(20, 140))
        if r.random() < 0.55:
            corre = int(r.normal(0, 90 * fuerza))
            out[y:y + alto] = np.roll(img[y:y + alto], corre, axis=1)
        y += alto
    return out

# ── la partitura: qué pasa en cada cuadro desde el búh ──────────────────────
# Umbral en k = 0-1 (el golpe), 13 y 27: tres destellos en el primer segundo, no más.
UMBRAL = {0: False, 1: True, 13: False, 27: False}
def plan(k):
    u = k / max(1, N - 1)
    p = 1 - math.exp(-k / 10)                                  # crece rápido al principio y sigue
    return dict(
        zoom=2.3 + 0.45 * u + (0.2 if k == 0 else 0),
        estira=1.30 + 0.55 * p + 0.25 * u,                     # la cara se alarga: 1,3 -> ~2,0 en el mentón
        angosta=0.90 - 0.08 * p,
        # se retuerce: el remolino crece y va y viene (como si se retorciera), sin pasar de ~50° en la nariz
        giro=math.radians((10 + 34 * p) * (1 + 0.35 * math.sin(k / 3.1))),
        tuerce=70 * p * math.sin(k / 5.5 + 0.6),               # la mandíbula se va a un costado y vuelve
        bulbo_ojo=0.28 + 0.16 * p,
        bulbo_boca=0.20 + 0.22 * p,
        amp=34 * math.exp(-k / 10) + 9,                        # sacudida: fuerte al golpe, sigue temblando
    )

def main():
    prueba = len(sys.argv) > 1 and sys.argv[1] == "prueba"
    cuadros = leer_cuadros(GOLPE, N)
    assert len(cuadros) == N, (len(cuadros), N)
    corr = seguir(cuadros)
    print("corrimiento de la cara (px):", " ".join(f"{a[0]:+.0f},{a[1]:+.0f}" for a in corr))
    ks = [int(x) for x in sys.argv[2:]] if prueba else list(range(N))
    fantasma = None
    tmp = SAL_DIR + "cuadros/"
    os.makedirs(tmp, exist_ok=True)
    for k in range(N):
        if prueba and k not in ks and k + 1 not in ks:
            continue
        c = corr[k]
        pl = plan(k)
        r = np.random.default_rng(5000 + k)
        sac = ((r.random() - 0.5) * 2 * pl["amp"], (r.random() - 0.5) * 2 * pl["amp"], math.radians((r.random() - 0.5) * 2 * 2.4))
        centro, ojos, boca = NARIZ + c, [OJO_I + c, OJO_D + c], BOCA + c + np.array([0, 10 * min(1, k / 12)])
        mx, my = mapa(centro, ojos, boca, pl["zoom"], pl["estira"], pl["angosta"], pl["giro"], sac, pl["bulbo_ojo"], pl["bulbo_boca"],
                      tuerce=pl["tuerce"])
        img = deformar(cuadros[k], mx, my)
        # dónde quedaron las pupilas en la salida: el píxel cuyo mapa cae más cerca de cada una
        ojos_sal = []
        for o in ojos:
            d = (mx - o[0]) ** 2 + (my - o[1]) ** 2
            iy, ix = np.unravel_index(np.argmin(d), d.shape)
            ojos_sal.append((float(ix), float(iy)))
        if k in UMBRAL:
            out = umbral(img, invertido=UMBRAL[k])
            fantasma = None
        else:
            out, L = espectro(img, ojos_sal, pl["zoom"], fantasma)
            fantasma = L
            if k in (2, 3, 14, 28):
                out = partir_rgb(out, 14)
        if k >= N - 5:
            out = franjas(out, k, (k - (N - 6)) / 5)
        if prueba:
            if k in ks:
                cv2.imwrite(SAL_DIR + f"k{k:02d}.png", out)
        else:
            cv2.imwrite(tmp + f"{k:03d}.png", out)
    if prueba:
        return
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "30", "-i", tmp + "%03d.png", "-c:v", "libx264", "-preset", "slow",
                    "-crf", "12", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                    "-movflags", "+faststart", RAIZ + "public/susto-v3.mp4"], check=True)
    print(f"public/susto-v3.mp4: {N} cuadros (edición {GOLPE}-{SUSTO_FIN - 1})")

if __name__ == "__main__":
    main()
