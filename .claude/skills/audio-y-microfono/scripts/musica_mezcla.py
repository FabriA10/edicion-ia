# Pasada de cierre CON MÚSICA (clienta, video 1): la misma de terminar_doscam.sh para
# la voz —precarga del AAC, la ganancia fija de la v2, limitador con latency=1—
# más la cama del tema "biscuit" de lukrembo, agachada por la propia voz.
#
# Dónde cae el tema: el drop (primer golpe después del hueco de un tiempo, en
# 12,071 s del tema) va justo en el corte a "bien indicado" (cuadro 174 =
# 5,800 s): el gancho termina "te digo cómo es en realidad", el tema se calla
# en ese "en realidad" y entra la batería con la respuesta. La intro filtrada
# suena de fondo debajo del gancho.
#
# La intro viene 25 dB más baja que el resto y vive entera en la banda de la
# voz (teclado filtrado en 1-2,5 kHz), así que no se nivela por LUFS sino por
# esa banda: se sube hasta quedar ~3 dB por DEBAJO de lo que el resto del tema
# pone en 300-3500 Hz. El cambio de ganancia cae adentro del hueco del tema,
# donde no suena nada.
#
# Salen el video terminado y la cama sola (mismo procesado, misma cadena
# lateral) para medirla: la mezcla no se puede separar después.
#
#   python musica_mezcla.py <render> <salida.mp4> <gan_tema_db> <gan_intro_db>
import json, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfiltfilt

W = "F:/edicion con ia/proyectos/04-dos-camaras/"
MUSICA = W + "trabajo/doscam01/musica-48k.wav"
CAMA = W + "trabajo/doscam01/cama-sola.wav"
PRECARGA = 0.042667   # el AAC de Remotion no declara su precarga (2048 muestras)
GAN_VOZ = 11.16       # la de la v1/v2/v5: la voz queda idéntica
DROP_TEMA = 12.071    # primer golpe del drop en el tema (muestra 579475 ≈ 12,0724; el ataque arranca en 12,071)
DROP_VIDEO = 174 / 30 # el corte a "bien indicado"
INICIO = DROP_TEMA - DROP_VIDEO
CAMBIO = 5.55         # adentro del hueco del tema (video 5,03-5,80): ahí cambia la ganancia
DUR = 1218 / 30
FUNDIDO_IN, FUNDIDO_OUT = 1.2, 2.2
LIMITE = 0.70         # con cama de música el AAC sobrepasa 1,5 dB (audio.md)

render, salida = sys.argv[1], sys.argv[2]
gt, gi = float(sys.argv[3]), float(sys.argv[4])
lin = lambda db: 10 ** (db / 20)

filtro = (
    f"[0:a]atrim=start={PRECARGA},asetpts=N/SR/TB,volume={GAN_VOZ}dB,asplit=2[voz][llave];"
    f"[1:a]atrim=start={INICIO:.6f},asetpts=N/SR/TB,atrim=end={DUR},"
    f"volume='if(lt(t,{CAMBIO}),{lin(gi):.6f},{lin(gt):.6f})':eval=frame,"
    f"equalizer=f=2200:t=q:w=1.2:g=-3,"
    f"afade=t=in:st=0:d={FUNDIDO_IN},afade=t=out:st={DUR - FUNDIDO_OUT:.4f}:d={FUNDIDO_OUT}[mus];"
    f"[mus][llave]sidechaincompress=threshold=0.08:ratio=3:attack=15:release=400:detection=rms:knee=4,asplit=2[cama][cama2];"
    f"[voz][cama]amix=inputs=2:duration=first:normalize=0,"
    f"alimiter=limit={LIMITE}:attack=5:release=60:level=false:latency=1[mezcla]"
)
subprocess.run(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-i", render, "-i", MUSICA,
                "-filter_complex", filtro,
                "-map", "0:v", "-c:v", "copy", "-map", "[mezcla]", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                "-movflags", "+faststart", salida,
                "-map", "[cama2]", "-c:a", "pcm_f32le", CAMA], check=True)


def lufs(archivo, a=None, b=None):
    af = (f"atrim=start={a}:end={b}," if a is not None else "") + "ebur128=peak=true:framelog=quiet"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", archivo, "-af", af, "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    i = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
    tp = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)[-1])
    return i, tp


# --- la cama sola: LUFS y nivel en la banda de la voz, intro contra el resto
sr, c = wavfile.read(CAMA)
c = c.mean(1) if c.ndim > 1 else c
vb = sosfiltfilt(butter(4, [300, 3500], btype="band", fs=sr, output="sos"), c)
rms = lambda s, a, b: 20 * np.log10(np.sqrt(np.mean(s[int(a * sr): int(b * sr)] ** 2)) + 1e-12)
intro_l, _ = lufs(CAMA, FUNDIDO_IN, 5.0)
resto_l, _ = lufs(CAMA, DROP_VIDEO, DUR - FUNDIDO_OUT)
print(f"cama intro   ({FUNDIDO_IN}-5,0 s): {intro_l:6.1f} LUFS, banda de la voz {rms(vb, FUNDIDO_IN, 5.0):6.1f} dB")
print(f"cama resto (5,8-{DUR - FUNDIDO_OUT:.1f} s): {resto_l:6.1f} LUFS, banda de la voz {rms(vb, DROP_VIDEO, DUR - FUNDIDO_OUT):6.1f} dB")
i, tp = lufs(salida)
print(f"mezcla: {i:.2f} LUFS, pico real {tp:.2f} dBTP  -> la cama queda {i - resto_l:.1f} dB abajo de la mezcla")
