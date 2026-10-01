// ═══════════════════════════════════════════════════════════════
// HeritGoa — Sarvam AI Service
// Handles: Text translation + Speech-to-Text + Text-to-Speech
// All calls go via the Sarvam API (sarvam.ai)
// ═══════════════════════════════════════════════════════════════

const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;
const BASE_URL       = 'https://api.sarvam.ai';

// ── Language code map ──────────────────────────────────────────
export const LANGUAGE_OPTIONS = [
  { code: 'en-IN',  label: 'English',    flag: '🇬🇧', native: 'English'   },
  { code: 'kok-IN', label: 'Konkani',    flag: '🇮🇳', native: 'कोंकणी'    },
  { code: 'hi-IN',  label: 'Hindi',      flag: '🇮🇳', native: 'हिंदी'      },
  { code: 'mr-IN',  label: 'Marathi',    flag: '🇮🇳', native: 'मराठी'      },
  { code: 'pt-PT',  label: 'Portuguese', flag: '🇵🇹', native: 'Português'  },
];

// ── Pick a valid Sarvam TTS speaker per language ───────────────
// bulbul:v3 valid speakers: aditya, ritu, ashutosh, priya, neha, rahul,
//   pooja, rohan, simran, kavya, amit, dev, ishita, shreya, ratan, varun,
//   manan, sumit, roopa, kabir, aayan, shubh, advait, anand, tanya, tarun,
//   sunny, mani, gokul, vijay, shruti, suhani, mohit, kavitha, rehan, soham, rupali
// TTS supported langs: en-IN, hi-IN, mr-IN (kok-IN and pt-PT require beta access — fallback to en-IN)
function getSpeakerForLang(langCode) {
  const speakerMap = {
    'en-IN':  'ritu',    // English — female
    'hi-IN':  'priya',   // Hindi — female
    'mr-IN':  'pooja',   // Marathi — female
    'kok-IN': 'ritu',    // Konkani — no TTS support, fallback to English
    'pt-PT':  'ritu',    // Portuguese — no TTS support, fallback to English
  };
  return speakerMap[langCode] ?? 'ritu';
}

// TTS-supported language codes (kok-IN and pt-PT not supported yet in bulbul:v3)
const TTS_SUPPORTED = new Set(['en-IN', 'hi-IN', 'mr-IN', 'bn-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'ta-IN', 'te-IN', 'pa-IN']);

export function getLangLabel(code) {
  return LANGUAGE_OPTIONS.find(l => l.code === code)?.label ?? code;
}

function assertKey() {
  if (!SARVAM_API_KEY || SARVAM_API_KEY === 'your-sarvam-api-key-here') {
    throw new Error('VITE_SARVAM_API_KEY is not set in .env. Please add your Sarvam API key.');
  }
}

// ─────────────────────────────────────────────────────────────
// translateText — text → translated text
// ─────────────────────────────────────────────────────────────
export async function translateText({ text, sourceLang = 'en-IN', targetLang = 'hi-IN' }) {
  assertKey();
  if (!text?.trim()) throw new Error('No text provided.');
  if (sourceLang === targetLang) return text;

  // sarvam-translate:v1 supports: en-IN, hi-IN, mr-IN, kok-IN, bn-IN, gu-IN, ta-IN, te-IN, kn-IN, ml-IN, pa-IN etc.
  // mayura:v1 does NOT support kok-IN.
  // pt-PT is not supported at all — fallback to en-IN source.
  const SUPPORTED_CODES = new Set([
    'en-IN','hi-IN','mr-IN','kok-IN','bn-IN','gu-IN','kn-IN','ml-IN','ta-IN','te-IN','pa-IN',
    'as-IN','od-IN','sa-IN','ur-IN','ne-IN','mai-IN','doi-IN','ks-IN','sd-IN','sat-IN','mni-IN','brx-IN',
  ]);

  const srcCode = SUPPORTED_CODES.has(sourceLang) ? sourceLang : 'en-IN';
  const tgtCode = SUPPORTED_CODES.has(targetLang) ? targetLang : 'hi-IN';

  if (srcCode === tgtCode) return text;

  const res = await fetch(`${BASE_URL}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': SARVAM_API_KEY,
    },
    body: JSON.stringify({
      input: text,
      source_language_code: srcCode,
      target_language_code: tgtCode,
      speaker_gender: 'Female',
      mode: 'formal',
      model: 'sarvam-translate:v1',
      enable_preprocessing: true,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message ?? err?.detail ?? err?.message ?? `Sarvam translate failed (${res.status})`;
    throw new Error(msg);
  }
  const data = await res.json();
  return data.translated_text ?? data.output ?? '';
}

// ─────────────────────────────────────────────────────────────
// speechToText — audio Blob → transcript string
// ─────────────────────────────────────────────────────────────
export async function speechToText({ audioBlob, sourceLang = 'kok-IN' }) {
  assertKey();
  const form = new FormData();
  form.append('file', audioBlob, 'recording.wav');

  // Supported STT codes in saaras:v3: hi-IN, mr-IN, en-IN, etc.
  // For unsupported codes like kok-IN or pt-PT, pass 'unknown' for auto-detection
  const sttLangMap = {
    'hi-IN':  'hi-IN',
    'mr-IN':  'mr-IN',
    'en-IN':  'en-IN',
    'kok-IN': 'unknown',
    'pt-PT':  'unknown',
  };
  const sttLang = sttLangMap[sourceLang] ?? 'unknown';

  form.append('language_code', sttLang);
  form.append('model', 'saaras:v3');

  const res = await fetch(`${BASE_URL}/speech-to-text`, {
    method: 'POST',
    headers: { 'api-subscription-key': SARVAM_API_KEY },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message ?? err?.detail ?? err?.message ?? `Sarvam STT failed (${res.status})`;
    throw new Error(msg);
  }
  const data = await res.json();
  return data.transcript ?? '';
}

// ─────────────────────────────────────────────────────────────
// textToSpeech — text → Blob URL (playable <audio> src)
// ─────────────────────────────────────────────────────────────
export async function textToSpeech({ text, targetLang = 'en-IN' }) {
  assertKey();
  if (!text?.trim()) throw new Error('No text provided for TTS.');

  // Fall back to en-IN for unsupported languages (kok-IN, pt-PT need beta access)
  const ttsLang    = TTS_SUPPORTED.has(targetLang) ? targetLang : 'en-IN';
  const ttsSpeaker = getSpeakerForLang(ttsLang);

  const res = await fetch(`${BASE_URL}/text-to-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': SARVAM_API_KEY,
    },
    body: JSON.stringify({
      inputs: [text.slice(0, 500)],
      target_language_code: ttsLang,
      speaker: ttsSpeaker,
      pitch: 0,
      pace: 1.0,
      loudness: 1.5,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
      model: 'bulbul:v3',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err?.error?.message ?? err?.message ?? `Sarvam TTS failed (${res.status})`;
    throw new Error(detail);
  }
  const data = await res.json();
  const b64  = data.audios?.[0];
  if (!b64) throw new Error('No audio returned from Sarvam TTS.');

  const bytes = atob(b64);
  const buf   = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

// ─────────────────────────────────────────────────────────────
// transcribeAndTranslate — full audio pipeline
// audioBlob → STT → translate → TTS
// Returns: { transcript, translatedText, audioUrl }
// ─────────────────────────────────────────────────────────────
export async function transcribeAndTranslate({ audioBlob, sourceLang = 'kok-IN', targetLang = 'en-IN', onStep }) {
  onStep?.('Transcribing audio...');
  const transcript = await speechToText({ audioBlob, sourceLang });

  onStep?.('Translating transcript...');
  const translatedText = await translateText({ text: transcript, sourceLang, targetLang });

  onStep?.('Generating translated audio...');
  const audioUrl = await textToSpeech({ text: translatedText, targetLang });

  return { transcript, translatedText, audioUrl };
}
