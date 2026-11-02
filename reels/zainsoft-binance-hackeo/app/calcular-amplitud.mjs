import fs from 'node:fs';

// Read trabajo/voz16.wav (PCM 16-bit LE, 16000 Hz, mono)
const buf = fs.readFileSync('trabajo/voz16.wav');
// WAV header is 44 bytes
const pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.byteLength - 44) / 2);
const sampleRate = 16000;
const fps = 30;
const samplesPerFrame = sampleRate / fps; // 533.333 samples per frame
const totalFrames = 1570;

const amplitudes = [];

for (let f = 0; f < totalFrames; f++) {
	const startSample = Math.floor(f * samplesPerFrame);
	const endSample = Math.min(pcm.length, Math.floor((f + 1) * samplesPerFrame));
	let sumSq = 0;
	let count = 0;
	for (let i = startSample; i < endSample; i++) {
		const val = pcm[i] / 32768;
		sumSq += val * val;
		count++;
	}
	const rms = count > 0 ? Math.sqrt(sumSq / count) : 0;
	// Normalize and apply non-linear response for natural mouth opening
	const raw = Math.min(1, rms * 7.5);
	const mouth = raw > 0.08 ? Math.pow((raw - 0.08) / 0.92, 0.8) : 0;
	amplitudes.push(Number(mouth.toFixed(3)));
}

fs.writeFileSync('src/bit/amplitud.json', JSON.stringify(amplitudes));
console.log(`Calculadas ${amplitudes.length} amplitudes de boca.`);
