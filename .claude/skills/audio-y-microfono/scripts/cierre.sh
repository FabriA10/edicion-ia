#!/bin/bash
# Pasada de cierre: mezcla la voz terminada (trabajo/voz/voz-final.wav, -14,5 LUFS, ya con el EQ del micrófono
# chico y su limitador), la cama de música (trabajo/musica/cama.wav) y los efectos (trabajo/sfx/extras.wav), y la
# pone sobre el render mudo de Remotion.
#
#   - la cama se lleva a -32 LUFS sola (17-18 dB abajo de la voz, references/audio.md), con un pozo de -3 dB en
#     2,2 kHz y agachada por la voz (sidechaincompress); el nivel se mide sobre el stem ya agachado
#   - los efectos entran con su ganancia de sfx.py
#   - la mezcla pasa por un lazo de ganancia hasta -14,5 LUFS y un limitador final a 0,70 (con música el AAC
#     sobrepasa ~1,5 dB: así queda abajo de -1 dBTP)
#
#   bash trabajo/scripts/cierre.sh <render sin .mp4> [salida sin .mp4]
set -euo pipefail
R="F:/edicion con ia/proyectos/11-animacion-2d-personajes"
VIDEO="$R/out/$1.mp4"
SALIDA="$R/out/${2:-$1-final}.mp4"
T="$R/trabajo/mezcla"
mkdir -p "$T"
VOZ="$R/trabajo/voz/voz-final.wav"
CAMA="$R/trabajo/musica/cama.wav"
EXTRAS="$R/trabajo/sfx/extras.wav"

medir() { ffmpeg -hide_banner -nostats -i "$1" -af ebur128=framelog=quiet -f null - 2>&1 | grep -A2 "Integrated" | grep -oP "I:\s+\K-?[0-9.]+"; }

# 1) cama agachada por la voz, sin nivelar
ffmpeg -y -hide_banner -v error -i "$CAMA" -i "$VOZ" -filter_complex \
  "[1:a]aformat=channel_layouts=stereo,asplit=2[vk][vx];[0:a]equalizer=f=2200:t=q:w=1.2:g=-3[m];[m][vk]sidechaincompress=threshold=0.06:ratio=3:attack=15:release=400:detection=rms:knee=4[d];[vx]anullsink" \
  -map "[d]" -c:a pcm_s16le "$T/cama-agachada.wav"
I=$(medir "$T/cama-agachada.wav")
GCAMA=$(node -e "console.log((-32 - ($I)).toFixed(2))")
echo "cama agachada: $I LUFS -> ganancia $GCAMA dB"

# 2) mezcla y lazo de ganancia hasta -14,5
GAN=0
for vuelta in 1 2 3 4 5 6; do
  ffmpeg -y -hide_banner -v error -i "$VOZ" -i "$T/cama-agachada.wav" -i "$EXTRAS" -filter_complex \
    "[0:a]aformat=channel_layouts=stereo[v];[1:a]volume=${GCAMA}dB[c];[v][c][2:a]amix=inputs=3:duration=first:normalize=0,volume=${GAN}dB,alimiter=limit=0.70:attack=5:release=60:level=false,atrim=start_sample=240,asetpts=N/SR/TB" \
    -c:a pcm_s16le "$T/mezcla.wav"
  M=$(medir "$T/mezcla.wav")
  echo "  vuelta $vuelta: ganancia $GAN dB -> $M LUFS"
  node -e "process.exit(Math.abs(($M)-(-14.5)) < 0.15 ? 0 : 1)" && break
  GAN=$(node -e "console.log((($GAN) + (-14.5) - ($M)).toFixed(2))")
done

# 3) sobre el video (el video se copia; el audio se codifica una sola vez)
ffmpeg -y -hide_banner -v error -i "$VIDEO" -i "$T/mezcla.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$SALIDA"
echo "--- nivel final ---"
ffmpeg -hide_banner -nostats -i "$SALIDA" -af ebur128=peak=all:framelog=quiet -f null - 2>&1 | grep -E "I:|Peak:" | head -4
ffprobe -v error -show_entries format=duration,bit_rate -show_entries stream=codec_type,codec_name,width,height,nb_frames,bit_rate -of default=nw=1 "$SALIDA" | sort -u
echo "### FIN ###"
