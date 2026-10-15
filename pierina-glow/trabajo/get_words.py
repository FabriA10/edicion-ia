import whisper, json

model = whisper.load_model('base')
res = model.transcribe('pierina-glow/voz.ogg', language='es', word_timestamps=True)

words_list = []
for seg in res['segments']:
    for w in seg.get('words', []):
        words_list.append({
            'word': w['word'].strip(),
            'start': round(w['start'], 2),
            'end': round(w['end'], 2)
        })

with open('pierina-glow/trabajo/words.json', 'w', encoding='utf-8') as f:
    json.dump(words_list, f, ensure_ascii=False, indent=2)

print(f"Total palabras extraidas: {len(words_list)}")
for i in range(0, len(words_list), 5):
    chunk = words_list[i:i+5]
    txt = " ".join([c['word'] for c in chunk])
    t0 = chunk[0]['start']
    t1 = chunk[-1]['end']
    print(f"[{t0:.2f}s - {t1:.2f}s] {txt}")
