
class WavRecorder {
    constructor(mediaStream) {
        this.recorder = new MediaRecorder(mediaStream);
        this.promise = null;
    }

    start() {
        this.promise = new Promise(async (resolve) => {
            var chunks = [];

            this.recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

            this.recorder.onstop = async (e) => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                const audioArrayBuffer = await audioBlob.arrayBuffer();
                const audioBuffer = await this.decodeAudioData(audioArrayBuffer);
                const wavBuffer = this.createWavFile(audioBuffer);
                const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
                const audioFile = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
                resolve(audioFile);
            };
        });

        this.recorder.start();
    }

    /**
     * @returns File (wav file)
     */
    async stop() {
        this.recorder.stop();

        return await this.promise;
    }

    async decodeAudioData(arrayBuffer) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return await audioContext.decodeAudioData(arrayBuffer);
    }

    createWavFile(audioBuffer) {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const numSamples = audioBuffer.length;

        const buffer = new ArrayBuffer(44 + numSamples * numChannels * 2);
        const view = new DataView(buffer);

        // RIFF identifier
        this.writeString(view, 0, 'RIFF');
        // RIFF chunk length
        view.setUint32(4, 36 + numSamples * numChannels * 2, true);
        // RIFF type
        this.writeString(view, 8, 'WAVE');
        // format chunk identifier
        this.writeString(view, 12, 'fmt ');
        // format chunk length
        view.setUint32(16, 16, true);
        // sample format (raw)
        view.setUint16(20, 1, true);
        // channel count
        view.setUint16(22, numChannels, true);
        // sample rate
        view.setUint32(24, sampleRate, true);
        // byte rate (sample rate * block align)
        view.setUint32(28, sampleRate * numChannels * 2, true);
        // block align (channel count * bytes per sample)
        view.setUint16(32, numChannels * 2, true);
        // bits per sample
        view.setUint16(34, 16, true);
        // data chunk identifier
        this.writeString(view, 36, 'data');
        // data chunk length
        view.setUint32(40, numSamples * numChannels * 2, true);

        // write the PCM samples
        const offset = 44;
        for (let i = 0; i < numSamples; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sample = audioBuffer.getChannelData(channel)[i];
                const s = Math.max(-1, Math.min(1, sample));
                view.setInt16(offset + (i * numChannels + channel) * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        }

        return buffer;
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}