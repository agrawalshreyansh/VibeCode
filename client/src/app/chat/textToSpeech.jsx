"use client";

function speakWithWebSpeech(text, { rate = 1, pitch = 1, volume = 1, voiceName } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        throw new Error('Browser TTS unavailable');
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    if (voiceName) {
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find(v => v.name === voiceName);
        if (match) utterance.voice = match;
    }
    window.speechSynthesis.cancel(); // stop any current speech
    window.speechSynthesis.speak(utterance);
    return utterance; // caller can track events/cancel if needed
}

// Safe client-side TTS helper that calls our Next.js API route.
// Usage: const audio = await tts("Hello there"); // returns HTMLAudioElement and tries autoplay
export async function tts(text, { autoplay = true, voiceId, preferBrowserTTS = false, speechRate = 1, speechPitch = 1, speechVolume = 1, speechVoiceName, outputFormat = 'mp3_22050_32' } = {}) {
    if (!text || typeof text !== "string") {
        throw new Error("tts(text) requires a non-empty string");
    }

    // If explicitly requested, use browser TTS immediately
    if (preferBrowserTTS) {
        try {
            return speakWithWebSpeech(text, { rate: speechRate, pitch: speechPitch, volume: speechVolume, voiceName: speechVoiceName });
        } catch (e) {
            // fall through to provider if browser TTS not available
        }
    }

    // If a public client-side key is provided, call ElevenLabs directly (public exposure)
    const PUBLIC_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const PUBLIC_VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
    const PUBLIC_MODEL_ID = process.env.NEXT_PUBLIC_ELEVENLABS_MODEL_ID || "eleven_monolingual_v1";

    try {
        let url;
        let blob;
            if (PUBLIC_KEY) {
                const vid = encodeURIComponent(voiceId || PUBLIC_VOICE_ID);
                const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${vid}/stream?output_format=${encodeURIComponent(outputFormat)}`;
            const res = await fetch(elevenUrl, {
                method: "POST",
                headers: {
                    "xi-api-key": PUBLIC_KEY,
                    "Content-Type": "application/json",
                    Accept: "audio/mpeg",
                },
                body: JSON.stringify({
                    model_id: PUBLIC_MODEL_ID,
                    text,
                    voice_settings: {
                        stability: 0.55,
                        similarity_boost: 0.75,
                        style: 0.0,
                        use_speaker_boost: true,
                    },
                }),
            });
            if (!res.ok) {
                const msg = await res.text().catch(() => "TTS failed");
                throw new Error(`TTS request failed: ${msg}`);
            }
            blob = await res.blob();
        } else {
            // Fallback to secure server-side proxy route
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, voiceId }),
            });
            if (!res.ok) {
                const msg = await res.text().catch(() => "TTS failed");
                throw new Error(`TTS request failed: ${msg}`);
            }
            blob = await res.blob();
        }

        url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        // Cleanup when done
        const revoke = () => URL.revokeObjectURL(url);
        audio.addEventListener("ended", revoke, { once: true });
        audio.addEventListener("error", revoke, { once: true });

        if (autoplay) {
            try {
                await audio.play();
            } catch (e) {
                // Autoplay may be blocked until a user gesture
                // eslint-disable-next-line no-console
                console.warn("Autoplay blocked; trigger audio.play() from a user gesture.");
            }
        }
        return audio;
    } catch (e) {
        // Provider failed or blocked; try browser TTS fallback
        try {
            return speakWithWebSpeech(text, { rate: speechRate, pitch: speechPitch, volume: speechVolume, voiceName: speechVoiceName });
        } catch (e2) {
            // If even browser TTS is unavailable, rethrow original error
            throw e;
        }
    }
}