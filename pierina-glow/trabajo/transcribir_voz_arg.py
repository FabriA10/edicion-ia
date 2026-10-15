import whisper, json

model = whisper.load_model('base')
res = model.transcribe('pierina-glow/voz arg.MP3', language='es', word_timestamps=True)

segments = []
for seg in res['segments']:
    segments.append({
        'start': round(seg['start'], 2),
        'end': round(seg['end'], 2),
        'text': seg['text'].strip()
    })

with open('pierina-glow/trabajo/segs_voz_arg.json', 'w', encoding='utf-8') as f:
    json.dump(segments, f, ensure_ascii=False, indent=2)

print(f"Total segmentos: {len(segments)}")
for s in segments:
    print(f"[{s['start']}s - {s['end']}s]: {s['text']}")
