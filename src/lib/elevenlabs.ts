/**
 * ElevenLabs Text-to-Speech utility
 * Uses the ElevenLabs streaming API to convert text to audio.
 * API key is read from VITE_ELEVENLABS_API_KEY (set in .env, never committed).
 */

const API_KEY  = import.meta.env.VITE_ELEVENLABS_API_KEY as string;
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // "George" — professional analyst voice
const MODEL_ID = 'eleven_turbo_v2';         // Fastest + cheapest tier

export interface TTSOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;       // 0–1 (higher = more consistent)
  similarityBoost?: number; // 0–1 (higher = closer to voice clone)
  style?: number;           // 0–1 (higher = more expressive)
}

let currentAudio: HTMLAudioElement | null = null;

/**
 * Speak text using ElevenLabs TTS.
 * Returns a control object with stop() and a promise that resolves on completion.
 */
export async function speakText(
  text: string,
  opts: TTSOptions = {},
  onStart?: () => void,
  onEnd?: () => void,
): Promise<{ stop: () => void }> {
  // Stop any existing playback first
  stopSpeaking();

  if (!API_KEY || API_KEY === 'your-elevenlabs-api-key') {
    console.warn('[ElevenLabs] API key not set — playing silence mock');
    onStart?.();
    await new Promise(r => setTimeout(r, 2000));
    onEnd?.();
    return { stop: () => {} };
  }

  const voiceId = opts.voiceId || VOICE_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: text.slice(0, 2500), // hard cap to avoid large bills
      model_id: opts.modelId || MODEL_ID,
      voice_settings: {
        stability:        opts.stability       ?? 0.55,
        similarity_boost: opts.similarityBoost ?? 0.80,
        style:            opts.style           ?? 0.20,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errText}`);
  }

  const blob  = await response.blob();
  const url2  = URL.createObjectURL(blob);
  const audio = new Audio(url2);
  currentAudio = audio;

  audio.onplay  = () => onStart?.();
  audio.onended = () => { onEnd?.(); URL.revokeObjectURL(url2); currentAudio = null; };
  audio.onerror = () => { onEnd?.(); URL.revokeObjectURL(url2); currentAudio = null; };

  audio.play();

  return {
    stop: () => {
      audio.pause();
      URL.revokeObjectURL(url2);
      currentAudio = null;
      onEnd?.();
    },
  };
}

/** Stop any currently playing TTS audio. */
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

/** Whether any TTS audio is currently playing. */
export function isSpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}
