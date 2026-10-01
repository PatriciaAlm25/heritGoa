// ═══════════════════════════════════════════════════════════════
// HeritGoa — AI Translation Page (Feature 12)
// Standalone page — no need for a heritage site context.
// Users can type/paste/record text in any regional language and
// have it translated instantly via Sarvam AI.
// ═══════════════════════════════════════════════════════════════
import Navbar from '../components/layout/Navbar';
import TranslationPanel from '../components/heritage/TranslationPanel';

// Sample Goa heritage text snippets for demo
const SAMPLE_FIELDS = [
  {
    label: '🏛️ Cultural Heritage',
    content: 'Goa possesses a unique cultural heritage blending indigenous Konkani traditions with centuries of historical architecture and living oral legends passed down through generations.',
  },
  {
    label: '⛪ Chapel Traditions',
    content: 'The annual feast of the local chapel brings villagers together to celebrate traditional Goan music, food, and oral legends passed down across generations.',
  },
  {
    label: '🌊 Coastal Legends',
    content: 'Local fishermen pass down stories of ancient sea voyages, trade routes, and sacred coastal groves protected by village deity shrines for centuries.',
  },
  {
    label: '🏰 Fort Stories',
    content: 'Chapora Fort, perched above Vagator beach, witnessed centuries of Portuguese rule, local resistance, and the vibrant cultural exchange that shaped Goa\'s identity.',
  },
];

export default function AITranslationPage() {
  return (
    <div className="min-h-screen bg-navy text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-12 px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(212,175,55,0.08), transparent)' }} />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37' }}>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            🌐 Feature 12 · Powered by Sarvam AI
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            AI Heritage Translation<br />
            <em className="not-italic"
              style={{ background: 'linear-gradient(135deg,#d4af37,#c8a227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Text + Voice
            </em>
          </h1>

          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
            Translate Goa's heritage knowledge — written text or spoken stories — across
            <strong className="text-white/80"> Konkani, Marathi, Hindi, English</strong> and more.
            Type your text, paste heritage notes, or record a local guide's voice and hear it translated instantly.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: '📝', title: 'Text Translation', desc: 'Type or paste any heritage text. Select source and target language, click Translate.' },
            { icon: '🎙️', title: 'Voice Recording', desc: 'Record a local guide or resident speaking. Sarvam AI transcribes the audio automatically.' },
            { icon: '🔊', title: 'Audio Playback', desc: 'Listen to the translated text as synthesized speech in your preferred language.' },
          ].map(step => (
            <div key={step.title} className="card-glass rounded-2xl p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
                {step.icon}
              </div>
              <div>
                <div className="font-semibold text-white text-sm mb-1">{step.title}</div>
                <div className="text-white/50 text-xs leading-relaxed">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Translation Panel */}
        <TranslationPanel
          siteName="Goa Heritage"
          textFields={SAMPLE_FIELDS}
        />

        {/* Language support note */}
        <div className="mt-6 text-center text-xs text-white/30">
          Supported languages: English · Konkani · Hindi · Marathi · Bengali · Gujarati · Kannada · Malayalam · Tamil · Telugu and more
        </div>
      </section>
    </div>
  );
}
