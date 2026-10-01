// ═══════════════════════════════════════════════════════════════
// HeritGoa — TranslationPanel (Feature 12)
// AI Heritage Translation: Text + Voice (Sarvam AI)
//
// Modes:
//  1. Text Translation — translate any heritage text field
//  2. Voice Story      — record → STT → translate → TTS
// ═══════════════════════════════════════════════════════════════
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Globe, Mic, MicOff, Play, Square, Volume2,
  ChevronDown, Loader2, AlertCircle, CheckCircle2,
  FileText, Radio, ArrowRight,
} from 'lucide-react';
import {
  LANGUAGE_OPTIONS,
  getLangLabel,
  translateText,
  textToSpeech,
  transcribeAndTranslate,
} from '../../services/sarvamService';

// ── Recording states ──────────────────────────────────────────
const RS = { IDLE: 'idle', RECORDING: 'recording', PROCESSING: 'processing', DONE: 'done' };

// ── Language selector ─────────────────────────────────────────
function LangSelect({ value, onChange, label, id }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-white/6 border border-white/12 rounded-xl px-3 py-2.5 text-sm text-white outline-none
                     focus:border-amber-500/50 transition-colors cursor-pointer pr-8"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {LANGUAGE_OPTIONS.map(l => (
            <option key={l.code} value={l.code} style={{ background: '#1a2332', color: '#fff' }}>
              {l.flag} {l.label} — {l.native}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Audio player ──────────────────────────────────────────────
function AudioPlayer({ src, label, accentColor = '#d4af37' }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnd = () => setPlaying(false);
    el.addEventListener('ended', onEnd);
    return () => el.removeEventListener('ended', onEnd);
  }, [src]);

  if (!src) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{ background: `${accentColor}08`, borderColor: `${accentColor}25` }}>
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105"
        style={{ background: `${accentColor}22`, color: accentColor }}
        title={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold" style={{ color: accentColor }}>{label}</div>
        <div className="text-white/35 text-xs">Click to {playing ? 'pause' : 'play'}</div>
      </div>
      <Volume2 size={16} className="text-white/25 shrink-0" />
      <audio ref={audioRef} src={src} preload="none" />
    </div>
  );
}

// ── Error notice ──────────────────────────────────────────────
function ErrorNotice({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
      <AlertCircle size={13} className="shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TranslationPanel — main exported component
// Props:
//   siteName  — heritage site name (for context display)
//   textFields — [{ label, content }] — text sections to translate
// ─────────────────────────────────────────────────────────────
export default function TranslationPanel({ siteName, textFields = [] }) {
  // ── Mode: 'text' | 'voice' ─────────────────────────────────
  const [mode, setMode] = useState('text');

  // ── Shared language state ──────────────────────────────────
  const [sourceLang, setSourceLang] = useState('en-IN');
  const [targetLang, setTargetLang] = useState('hi-IN');

  // ── Text translation state ─────────────────────────────────
  const DEFAULT_TEXT = 'Goa possesses a unique cultural heritage blending indigenous Konkani traditions with centuries of historical architecture and living oral legends.';
  const [customText,    setCustomText]        = useState('');
  const [selectedField, setSelectedField]     = useState(0);
  const [translating,   setTranslating]       = useState(false);
  const [translatedText, setTranslatedText]   = useState('');
  const [ttsUrl,        setTtsUrl]            = useState('');
  const [ttsLoading,    setTtsLoading]        = useState(false);
  const [textError,     setTextError]         = useState('');

  // ── Voice recording state ──────────────────────────────────
  const [recState,      setRecState]          = useState(RS.IDLE);
  const [recSeconds,    setRecSeconds]        = useState(0);
  const [recStep,       setRecStep]           = useState('');
  const [voiceResult,   setVoiceResult]       = useState(null); // { transcript, translatedText, audioUrl }
  const [origAudioUrl,  setOrigAudioUrl]      = useState('');
  const [voiceError,    setVoiceError]        = useState('');

  const mediaRecRef    = useRef(null);
  const chunksRef      = useRef([]);
  const timerRef       = useRef(null);

  // Cleanup blob URLs on unmount
  useEffect(() => () => {
    if (ttsUrl)          URL.revokeObjectURL(ttsUrl);
    if (origAudioUrl)    URL.revokeObjectURL(origAudioUrl);
    if (voiceResult?.audioUrl) URL.revokeObjectURL(voiceResult.audioUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Validate lang pair ─────────────────────────────────────
  const langPairOk = sourceLang !== targetLang;

  // Active text to translate
  const activeInputText = customText.trim() !== ''
    ? customText
    : (textFields[selectedField]?.content || DEFAULT_TEXT);

  // ── TEXT: translate custom text or selected field ──────────
  const handleTextTranslate = useCallback(async () => {
    setTextError('');
    setTranslatedText('');
    setTtsUrl('');
    if (!activeInputText?.trim()) { setTextError('Please enter or select text to translate.'); return; }
    if (!langPairOk)             { setTextError('Source and target languages must be different.'); return; }

    setTranslating(true);
    try {
      const result = await translateText({ text: activeInputText, sourceLang, targetLang });
      setTranslatedText(result);
    } catch (e) {
      setTextError(e.message);
    } finally {
      setTranslating(false);
    }
  }, [activeInputText, sourceLang, targetLang, langPairOk]);

  // ── TEXT: generate audio for translated text ───────────────
  const handleTextTTS = useCallback(async () => {
    if (!translatedText) return;
    setTtsLoading(true);
    try {
      const url = await textToSpeech({ text: translatedText, targetLang });
      setTtsUrl(url);
    } catch (e) {
      setTextError(e.message);
    } finally {
      setTtsLoading(false);
    }
  }, [translatedText, targetLang]);

  // ── VOICE: start recording ─────────────────────────────────
  const startRecording = useCallback(async () => {
    setVoiceError('');
    setVoiceResult(null);
    setOrigAudioUrl('');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecRef.current = mr;

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const origUrl = URL.createObjectURL(blob);
        setOrigAudioUrl(origUrl);

        setRecState(RS.PROCESSING);
        try {
          const result = await transcribeAndTranslate({
            audioBlob: blob,
            sourceLang,
            targetLang,
            onStep: msg => setRecStep(msg),
          });
          setVoiceResult(result);
          setRecState(RS.DONE);
        } catch (e) {
          setVoiceError(e.message);
          setRecState(RS.IDLE);
        }
      };

      mr.start();
      setRecState(RS.RECORDING);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch (e) {
      setVoiceError(e.message ?? 'Microphone access denied.');
    }
  }, [sourceLang, targetLang]);

  // ── VOICE: stop recording ──────────────────────────────────
  const stopRecording = useCallback(() => {
    mediaRecRef.current?.stop();
    clearInterval(timerRef.current);
  }, []);

  // ── VOICE: reset ───────────────────────────────────────────
  const resetVoice = () => {
    setVoiceResult(null);
    setOrigAudioUrl('');
    setVoiceError('');
    setRecState(RS.IDLE);
    setRecSeconds(0);
    setRecStep('');
  };

  // ── Reset translations when language changes ───────────────
  useEffect(() => { setTranslatedText(''); setTtsUrl(''); setTextError(''); }, [sourceLang, targetLang]);

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  // Ensure available textFields
  const hasTextFields = textFields.some(f => f.content?.trim());

  return (
    <div className="card-glass rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(212,175,55,0.18)' }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-white/8"
        style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.07),rgba(212,175,55,0.02))' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)' }}>
            <Globe size={16} style={{ color: '#d4af37' }} />
          </div>
          <div>
            <h3 className="font-playfair text-base font-bold text-white leading-none">AI Heritage Translation</h3>
            <p className="text-white/40 text-xs mt-0.5">Powered by Sarvam AI</p>
          </div>
          <div className="ml-auto text-xs px-2 py-1 rounded-full"
            style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}>
            🌐 Feature 12
          </div>
        </div>
        <p className="text-white/40 text-xs mt-2 leading-relaxed">
          Experience Goa's heritage in the language it was originally told in — or understand it in your own language.
        </p>
      </div>

      {/* ── Mode tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-white/8">
        {[
          { id: 'text',  icon: FileText, label: '📝 Text Translation' },
          { id: 'voice', icon: Radio,    label: '🎙️ Voice Story'       },
        ].map(tab => (
          <button key={tab.id} onClick={() => setMode(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
              ${mode === tab.id ? 'text-white border-b-2' : 'text-white/40 hover:text-white/70'}`}
            style={{ borderColor: mode === tab.id ? '#d4af37' : 'transparent' }}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">

        {/* ── Language pair (shared) ───────────────────────────── */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
          <LangSelect
            id="source-lang"
            label="From"
            value={sourceLang}
            onChange={v => { setSourceLang(v); resetVoice(); }}
          />
          <div className="pb-2.5">
            <ArrowRight size={16} className="text-white/25" />
          </div>
          <LangSelect
            id="target-lang"
            label="To"
            value={targetLang}
            onChange={v => { setTargetLang(v); resetVoice(); }}
          />
        </div>

        {!langPairOk && (
          <p className="text-xs text-amber-400/70 flex items-center gap-1.5">
            <AlertCircle size={12} /> Source and target languages must be different.
          </p>
        )}

        {/* ══════════════════════════════════════════════════════
            TEXT MODE
        ══════════════════════════════════════════════════════ */}
        {mode === 'text' && (
          <div className="space-y-4">
            {/* Field selector or preset selector */}
            {textFields.length > 0 ? (
              <div>
                <span className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Select Section</span>
                <div className="flex flex-wrap gap-2">
                  {textFields.map((f, i) => (
                    <button key={i} onClick={() => { setSelectedField(i); setCustomText(''); setTranslatedText(''); setTtsUrl(''); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border
                        ${selectedField === i && !customText
                          ? 'border-amber-500/50 text-amber-300 bg-amber-500/10'
                          : 'border-white/10 text-white/50 bg-white/4 hover:bg-white/8'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Sample Heritage Texts</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '🏛️ Goa Cultural Heritage', text: 'Goa possesses a unique cultural heritage blending indigenous Konkani traditions with centuries of historical architecture and living oral legends.' },
                    { label: '⛪ Chapel Traditions', text: 'The annual feast of the local chapel brings villagers together to celebrate traditional music, food, and oral legends passed down across generations.' },
                    { label: '🌊 Coastal Legends', text: 'Local fishermen pass down stories of ancient sea voyages, trade routes, and sacred coastal groves protected by village deity shrines.' },
                  ].map((preset, idx) => (
                    <button key={idx} onClick={() => { setCustomText(preset.text); setTranslatedText(''); setTtsUrl(''); }}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10 text-white/60 bg-white/4 hover:bg-white/10 hover:text-white transition-all">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Editable Text Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/40 uppercase tracking-wider">
                  Text to Translate ({getLangLabel(sourceLang)})
                </span>
                {customText && (
                  <button onClick={() => { setCustomText(''); setTranslatedText(''); setTtsUrl(''); }}
                    className="text-[10px] text-white/30 hover:text-white/60">
                    Reset Text
                  </button>
                )}
              </div>
              <textarea
                value={activeInputText}
                onChange={e => { setCustomText(e.target.value); setTranslatedText(''); setTtsUrl(''); }}
                rows={3}
                placeholder="Enter or paste any heritage text, historical note, or local story to translate..."
                className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-xs text-white/80 outline-none focus:border-amber-500/50 transition-colors leading-relaxed resize-y"
              />
            </div>

            {/* Translate button */}
            <button
              onClick={handleTextTranslate}
              disabled={translating || !activeInputText?.trim() || !langPairOk}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
                         transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#d4af37,#a8892a)', color: '#0a1628' }}>
              {translating
                ? <><Loader2 size={14} className="animate-spin" /> Translating with Sarvam AI...</>
                : <><Globe size={14} /> Translate to {getLangLabel(targetLang)}</>}
            </button>

            <ErrorNotice msg={textError} />

            {/* Translated result */}
            {translatedText && (
              <div className="space-y-3">
                <div className="rounded-xl p-4 space-y-2"
                  style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.18)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={13} style={{ color: '#d4af37' }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#d4af37' }}>
                      {getLangLabel(targetLang)} Translation
                    </span>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{translatedText}</p>
                </div>

                {/* Listen button */}
                {!ttsUrl ? (
                  <button onClick={handleTextTTS} disabled={ttsLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
                               border border-white/12 text-white/70 hover:bg-white/6 transition-all disabled:opacity-40">
                    {ttsLoading
                      ? <><Loader2 size={13} className="animate-spin" /> Generating audio...</>
                      : <><Volume2 size={13} /> 🔊 Listen in {getLangLabel(targetLang)}</>}
                  </button>
                ) : (
                  <AudioPlayer src={ttsUrl} label={`🔊 Listen in ${getLangLabel(targetLang)}`} />
                )}
              </div>
            )}

            {/* No key notice */}
            <div className="flex items-start gap-2 text-xs text-white/30 mt-1"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              onClick={undefined}>
              <div className="rounded-xl px-3 py-2.5 flex gap-2 w-full">
                <Globe size={12} className="shrink-0 mt-0.5 text-white/25" />
                <span>
                  AI translates only verified heritage content. The original text always remains available.
                  Requires a <strong className="text-white/50">VITE_SARVAM_API_KEY</strong> in your .env file.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VOICE MODE
        ══════════════════════════════════════════════════════ */}
        {mode === 'voice' && (
          <div className="space-y-4">
            <div className="text-xs text-white/45 leading-relaxed rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              🎙️ A local resident or guide records a story in their native language. Sarvam AI transcribes, translates, and generates audio — so tourists can listen in their preferred language.
            </div>

            {/* Recording controls */}
            {recState === RS.IDLE && (
              <button onClick={startRecording} disabled={!langPairOk}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-semibold
                           transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(220,38,38,0.1))',
                         border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
                <Mic size={18} />
                Start Recording in {getLangLabel(sourceLang)}
              </button>
            )}

            {recState === RS.RECORDING && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 py-4 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-mono text-lg font-bold">{fmtTime(recSeconds)}</span>
                  <span className="text-white/40 text-sm">Recording…</span>
                </div>
                <button onClick={stopRecording}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
                             border border-white/12 text-white/70 hover:bg-white/6 transition-all">
                  <MicOff size={15} /> Stop Recording
                </button>
              </div>
            )}

            {recState === RS.PROCESSING && (
              <div className="text-center py-6 space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                  style={{ borderColor: 'rgba(212,175,55,0.3)', borderTopColor: '#d4af37' }} />
                <p className="text-white/60 text-sm">{recStep || 'Processing...'}</p>
                <p className="text-white/30 text-xs">
                  {getLangLabel(sourceLang)} → {getLangLabel(targetLang)}
                </p>
              </div>
            )}

            {recState === RS.DONE && voiceResult && (
              <div className="space-y-3">
                {/* Success badge */}
                <div className="flex items-center gap-2 text-xs"
                  style={{ color: '#4ade80' }}>
                  <CheckCircle2 size={14} />
                  <span className="font-semibold">Story processed successfully</span>
                </div>

                {/* Original audio */}
                {origAudioUrl && (
                  <AudioPlayer
                    src={origAudioUrl}
                    label={`🎙️ Original ${getLangLabel(sourceLang)} Recording`}
                    accentColor="#60a5fa"
                  />
                )}

                {/* Transcript */}
                {voiceResult.transcript && (
                  <div className="rounded-xl p-3"
                    style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)' }}>
                    <div className="text-[10px] text-blue-400/70 uppercase tracking-wider mb-1.5">
                      📝 {getLangLabel(sourceLang)} Transcript
                    </div>
                    <p className="text-white/65 text-xs leading-relaxed">{voiceResult.transcript}</p>
                  </div>
                )}

                {/* Translated text */}
                {voiceResult.translatedText && (
                  <div className="rounded-xl p-3"
                    style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.18)' }}>
                    <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: '#d4af37' }}>
                      🌐 {getLangLabel(targetLang)} Translation
                    </div>
                    <p className="text-white/75 text-xs leading-relaxed">{voiceResult.translatedText}</p>
                  </div>
                )}

                {/* Translated audio */}
                {voiceResult.audioUrl && (
                  <AudioPlayer
                    src={voiceResult.audioUrl}
                    label={`🔊 Listen in ${getLangLabel(targetLang)}`}
                    accentColor="#d4af37"
                  />
                )}

                {/* Record again */}
                <button onClick={resetVoice}
                  className="w-full py-2.5 rounded-xl text-xs font-medium border border-white/10
                             text-white/45 hover:text-white/70 hover:bg-white/4 transition-all">
                  🔄 Record Another Story
                </button>
              </div>
            )}

            <ErrorNotice msg={voiceError} />

            {/* Disclaimer */}
            <div className="text-[10px] text-white/25 leading-relaxed text-center">
              AI transcribes and translates local stories. HeritGoa never invents historical information —
              all original recordings remain accessible alongside translations.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
