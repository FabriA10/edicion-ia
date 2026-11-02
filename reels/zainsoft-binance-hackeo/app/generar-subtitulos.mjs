import fs from 'node:fs';

const rawTokens = JSON.parse(fs.readFileSync('src/bit/palabras.json', 'utf8'));

// Reconstruct full text and word timestamps
// Tokens can be subwords like " Pier", "ina", " Gl", "ow"
const words = [];
let curWord = null;

for (const tok of rawTokens) {
	const t = tok.text;
	const isPunct = /^[.,;:!?¿¡]+$/.test(t.trim());
	if (t.startsWith(' ') || isPunct || !curWord) {
		if (curWord) {
			words.push(curWord);
		}
		curWord = {
			text: t.trim(),
			start: tok.startMs / 1000,
			end: tok.endMs / 1000,
		};
	} else {
		curWord.text += t;
		curWord.end = tok.endMs / 1000;
	}
}
if (curWord) words.push(curWord);

// Fix known Whisper spelling quirks
for (const w of words) {
	if (w.text.toLowerCase() === 'beat') w.text = 'Bit';
	if (w.text.toLowerCase().includes('sainsoft') || w.text.toLowerCase() === 'sainsoft') w.text = 'ZainSoft';
}

console.log('Total palabras agrupadas:', words.length);

// Generate subtitle cues (max 3-4 words, minúsculas, sin puntos)
const cues = [];
let chunk = [];

for (let i = 0; i < words.length; i++) {
	const w = words[i];
	// filter pure punctuation
	if (/^[.,;:!?¿¡]+$/.test(w.text)) continue;

	chunk.push(w);
	const textLen = chunk.map((c) => c.text).join(' ').length;
	const isEndOfSentence = /[.!?]/.test(words[i].text) || (words[i + 1] && /^[.!?]$/.test(words[i + 1].text));
	const pauseAfter = words[i + 1] ? words[i + 1].start - w.end > 0.35 : true;

	if (chunk.length >= 4 || textLen > 24 || isEndOfSentence || pauseAfter) {
		const cleanText = chunk
			.map((c) => c.text.replace(/[.,!?¿¡]/g, '').trim())
			.filter(Boolean)
			.join(' ')
			.toLowerCase();

		if (cleanText) {
			cues.push({
				start: Number(chunk[0].start.toFixed(2)),
				end: Number(chunk[chunk.length - 1].end.toFixed(2)),
				text: cleanText,
			});
		}
		chunk = [];
	}
}

fs.writeFileSync('src/bit/subtitulos.json', JSON.stringify(cues, null, 2));
console.log(`Generados ${cues.length} subtítulos limpios.`);
for (const c of cues.slice(0, 10)) {
	console.log(`[${c.start}s - ${c.end}s]: "${c.text}"`);
}
