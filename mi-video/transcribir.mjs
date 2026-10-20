import path from 'node:path';
import fs from 'node:fs';
import {transcribe, toCaptions} from '@remotion/install-whisper-cpp';

const to = path.join(process.cwd(), 'whisper.cpp');
const out = await transcribe({
	inputPath: path.join(process.cwd(), 'trabajo', 'voz16.wav'),
	whisperPath: to,
	whisperCppVersion: '1.5.5',
	model: 'medium',
	tokenLevelTimestamps: true,
	language: 'es',
});
const {captions} = toCaptions({whisperCppOutput: out});
if (!fs.existsSync('src/bit')) {
	fs.mkdirSync('src/bit', {recursive: true});
}
fs.writeFileSync('src/bit/palabras.json', JSON.stringify(captions, null, 2));
console.log(`Transcritas ${captions.length} frases.`);
for (const c of captions) {
	console.log(`[${(c.startMs / 1000).toFixed(2)}s - ${(c.endMs / 1000).toFixed(2)}s]: ${c.text}`);
}
