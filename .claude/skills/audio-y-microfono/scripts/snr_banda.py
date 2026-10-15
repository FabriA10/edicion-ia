# Voz contra cama EN LA BANDA DE LA VOZ (300-3500 Hz), ventana de 100 ms, sólo
# donde hay voz: dónde queda más apretada la separación. Si "arruina" cae en
# un mínimo, la música la tapa de verdad.
import subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfiltfilt
R = "F:/edicion con ia/proyectos/04-dos-camaras/"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", R + "out/doscam-01-v5-final.mp4", "-ac", "1", "-ar", "48000", "-c:a", "pcm_f32le", "voz-v5.wav"], check=True)
sr, v = wavfile.read("voz-v5.wav")
_, c = wavfile.read(R + "trabajo/doscam01/cama-sola.wav"); c = c.mean(1)
n = min(len(v), len(c)); v, c = v[:n], c[:n]
sos = butter(4, [300, 3500], btype="band", fs=sr, output="sos")
V, C = sosfiltfilt(sos, v), sosfiltfilt(sos, c)
H = int(0.1 * sr); k = n // H
lv = 10 * np.log10((V[:k*H].reshape(k, H) ** 2).mean(1) + 1e-12)
lc = 10 * np.log10((C[:k*H].reshape(k, H) ** 2).mean(1) + 1e-12)
voz = lv > np.percentile(lv, 50) - 15
s = lv - lc
print(f"separación en la banda de la voz, ventanas con voz: mediana {np.median(s[voz]):.1f} dB, p10 {np.percentile(s[voz],10):.1f}, mínimo {s[voz].min():.1f}")
print(f"  gancho (0-5,8 s): mediana {np.median(s[:58][voz[:58]]):.1f} dB | resto: mediana {np.median(s[58:][voz[58:]]):.1f} dB")
print("las 12 ventanas más apretadas:")
for i in np.argsort(np.where(voz, s, 99))[:12]:
    print(f"  {i*0.1:5.1f} s  voz {lv[i]:6.1f}  cama {lc[i]:6.1f}  separación {s[i]:5.1f} dB")
print("tramo de 'es si arruina el esmalte' (2,4-3,8 s):")
print("  " + " ".join(f"{i*0.1:.1f}:{s[i]:.0f}" for i in range(24, 38)))
