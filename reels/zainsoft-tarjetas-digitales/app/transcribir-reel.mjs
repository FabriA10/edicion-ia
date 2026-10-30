import path from 'node:path';
import fs from 'node:fs';
import {installWhisperCpp, downloadWhisperModel, transcribe, toCaptions} from '@remotion/install-whisper-cpp';

const to = path.join(process.cwd(), 'whisper.cpp');
const model = process.argv[2] || 'small';
await installWhisperCpp({to, version: '1.5.5'});
await downloadWhisperModel({model, folder: to});
const out = await transcribe({
	inputPath: path.join(process.cwd(), 'trabajo', 'voz16.wav'),
	whisperPath: to,
	whisperCppVersion: '1.5.5',
	model,
	tokenLevelTimestamps: true,
	language: 'es',
});
const {captions} = toCaptions({whisperCppOutput: out});
fs.mkdirSync('src/reel', {recursive: true});
fs.writeFileSync('src/reel/palabras.json', JSON.stringify(captions, null, 2));
for (const c of captions) console.log(`[${(c.startMs / 1000).toFixed(2)}-${(c.endMs / 1000).toFixed(2)}] ${c.text}`);
