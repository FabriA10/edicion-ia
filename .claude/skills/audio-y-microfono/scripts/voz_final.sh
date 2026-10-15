#!/bin/bash
# La voz en off terminada (sin música ni efectos): EQ del micrófono chico (audio.md) con -15 dB de margen,
# de-esser suave como en terminar.sh del 3009, y ganancia en lazo de seis vueltas hasta -14,5 LUFS con
# limitador 0,78 (atrim de 240 muestras: compensa la anticipación del limitador).
#   bash trabajo/scripts/voz_final.sh   -> public/voz-eq.wav (sólo EQ, para el estudio) y trabajo/voz/voz-final.wav
set -euo pipefail
R="F:/edicion con ia/proyectos/11-animacion-2d-personajes"
EQ="volume=-15dB,bass=g=8.7:f=45:width_type=q:w=0.7,equalizer=f=171:width_type=q:w=1.1:g=5.2,equalizer=f=1600:width_type=q:w=1.1:g=-4.0,treble=g=11:f=3500:width_type=q:w=0.7"
DEESS="asplit=2[lo][hi];[lo]lowpass=f=5200:p=2[l];[hi]highpass=f=5200:p=2,acompressor=threshold=-32dB:ratio=3:attack=1:release=60:knee=4:makeup=1[h];[l][h]amix=inputs=2:normalize=0"
OBJ="${1:--14.5}"
ffmpeg -y -hide_banner -v error -i "$R/public/voz-cruda.wav" -af "$EQ" -c:a pcm_s16le "$R/public/voz-eq.wav"
medir() { ffmpeg -hide_banner -nostats -i "$1" -af ebur128=framelog=quiet -f null - 2>&1 | grep -A2 "Integrated" | grep -oP "I:\s+\K-?[0-9.]+"; }
I=$(medir "$R/public/voz-eq.wav"); GAN=$(node -e "console.log(($OBJ - ($I)).toFixed(2))")
for vuelta in 1 2 3 4 5 6; do
  ffmpeg -y -hide_banner -v error -i "$R/public/voz-eq.wav" -filter_complex \
    "$DEESS,volume=${GAN}dB,alimiter=limit=0.78:attack=5:release=60:level=false,atrim=start_sample=240,asetpts=N/SR/TB" \
    -c:a pcm_s16le "$R/trabajo/voz/voz-final.wav"
  M=$(medir "$R/trabajo/voz/voz-final.wav"); echo "  vuelta $vuelta: ganancia $GAN dB -> $M LUFS"
  node -e "process.exit(Math.abs(($M)-($OBJ)) < 0.15 ? 0 : 1)" && break
  GAN=$(node -e "console.log((($GAN) + ($OBJ) - ($M)).toFixed(2))")
done
ffmpeg -hide_banner -nostats -i "$R/trabajo/voz/voz-final.wav" -af ebur128=peak=all:framelog=quiet -f null - 2>&1 | grep -E "I:|Peak:" | head -4
