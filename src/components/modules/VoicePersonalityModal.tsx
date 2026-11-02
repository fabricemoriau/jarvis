import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  Sliders,
  Check,
  RefreshCw,
  Play,
  Square,
  Smile,
  Zap,
  Shield,
  Compass,
  MessageSquareQuote,
  Flame,
} from 'lucide-react';
import { JarvisPersonalityProfile, JarvisTone } from '../../types';
import { jarvisVoice } from '../../services/voice';
import { updateJarvisPersonality, fetchJarvisPersonality } from '../../services/api';

interface VoicePersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonalityUpdated?: (personality: JarvisPersonalityProfile) => void;
}

export const VoicePersonalityModal: React.FC<VoicePersonalityModalProps> = ({
  isOpen,
  onClose,
  onPersonalityUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'personality' | 'voice'>('personality');
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Personality state
  const [tone, setTone] = useState<JarvisTone>('sarcastic');
  const [sarcasmLevel, setSarcasmLevel] = useState<number>(75);
  const [userSalutation, setUserSalutation] = useState<string>('Monsieur Fabrice');
  
  // Voice synthesis state
  const [voicePreset, setVoicePreset] = useState<'jarvis_classic' | 'jarvis_cyber' | 'friday' | 'karen'>('jarvis_classic');
  const [pitch, setPitch] = useState<number>(0.95);
  const [rate, setRate] = useState<number>(1.05);
  const [volume, setVolume] = useState<number>(1.0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  // Initial load
  useEffect(() => {
    if (!isOpen) return;

    // Load available browser voices
    const voices = jarvisVoice.getAvailableVoices();
    setBrowserVoices(voices);

    // Load current voice settings from jarvisVoice service
    const currentVoiceSettings = jarvisVoice.getSettings();
    setVoicePreset(currentVoiceSettings.preset);
    setPitch(currentVoiceSettings.pitch);
    setRate(currentVoiceSettings.rate);
    setVolume(currentVoiceSettings.volume);
    setSelectedVoiceURI(currentVoiceSettings.selectedVoiceURI || '');

    // Load personality from server / fallback localStorage
    fetchJarvisPersonality()
      .then((data) => {
        if (data.personality) {
          setTone(data.personality.tone || 'sarcastic');
          setSarcasmLevel(data.personality.sarcasmLevel ?? 75);
          setUserSalutation(data.personality.userSalutation || 'Monsieur Fabrice');
          if (data.personality.voicePreset) setVoicePreset(data.personality.voicePreset);
          if (data.personality.pitch !== undefined) setPitch(data.personality.pitch);
          if (data.personality.rate !== undefined) setRate(data.personality.rate);
        }
      })
      .catch(() => {
        // Fallback local storage
        const saved = localStorage.getItem('jarvis_personality_profile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.tone) setTone(parsed.tone);
            if (parsed.sarcasmLevel !== undefined) setSarcasmLevel(parsed.sarcasmLevel);
            if (parsed.userSalutation) setUserSalutation(parsed.userSalutation);
          } catch (e) {}
        }
      });
  }, [isOpen]);

  if (!isOpen) return null;

  // Tone definitions with descriptions & icons
  const tonesList: Array<{
    id: JarvisTone;
    name: string;
    subtitle: string;
    icon: React.ComponentType<any>;
    color: string;
    description: string;
    badge: string;
  }> = [
    {
      id: 'sarcastic',
      name: 'Sarcastique & Piquant',
      subtitle: 'Style Tony Stark authentique',
      icon: Zap,
      color: 'from-amber-500 to-rose-600',
      description:
        'Humour noir, piques d’esprit, remarques cyniques et ironie brillante. Répond à vos questions avec efficacité tout en se moquant gentiment de vos habitudes.',
      badge: 'Recommandé Iron Man',
    },
    {
      id: 'humorous',
      name: 'Humoristique & Décontracté',
      subtitle: 'Bonne humeur et réparties décalées',
      icon: Smile,
      color: 'from-yellow-400 to-orange-500',
      description:
        'Blagues technologiques, jeux de mots geek et atmosphère légère. Parfait pour rendre le travail et la gestion des serveurs amusants.',
      badge: 'Léger & Geek',
    },
    {
      id: 'classic',
      name: 'Majordome Classique & Raffiné',
      subtitle: 'Distinction britannique & déférence',
      icon: Sparkles,
      color: 'from-cyan-400 to-blue-600',
      description:
        'Courtoisie absolue, vocabulaire soutenu et formules de politesse impeccables. Le J.A.R.V.I.S. traditionnel et dévoué de Paul Bettany.',
      badge: 'Traditionnel',
    },
    {
      id: 'tactical',
      name: 'Tacticien & Opérations',
      subtitle: 'Compte-rendu militaire direct',
      icon: Shield,
      color: 'from-emerald-400 to-teal-600',
      description:
        'Phrases courtes, télégraphiques, factuelles. Priorité maximale à la vitesse d’exécution, aux métriques et au résultat opérationnel.',
      badge: 'Opérationnel',
    },
    {
      id: 'philosophical',
      name: 'Philosophe Cybernétique',
      subtitle: 'Méditation sur le code et l’univers',
      icon: Compass,
      color: 'from-purple-400 to-indigo-600',
      description:
        'Prend du recul sur vos demandes en y apportant une nuance existentielle ou poétique sur la coexistence de l’homme et de la machine.',
      badge: 'Conceptuel',
    },
  ];

  // Voice presets definitions
  const voicePresets = [
    {
      id: 'jarvis_classic',
      name: 'J.A.R.V.I.S. Classique',
      description: 'Voix masculine posée, chaleureuse et mesurée',
      defaultPitch: 0.95,
      defaultRate: 1.05,
    },
    {
      id: 'jarvis_cyber',
      name: 'J.A.R.V.I.S. Cybernétique',
      description: 'Traitement modulé plus grave avec intonation dynamique',
      defaultPitch: 0.85,
      defaultRate: 1.15,
    },
    {
      id: 'friday',
      name: 'F.R.I.D.A.Y. Tactique',
      description: 'Voix féminine sophistiquée, incisive et précise',
      defaultPitch: 1.15,
      defaultRate: 1.08,
    },
    {
      id: 'karen',
      name: 'K.A.R.E.N. Naturelle',
      description: 'Voix féminine fluide, empathique et douce',
      defaultPitch: 1.05,
      defaultRate: 1.0,
    },
  ];

  // Generate sample dialogue line based on current settings
  const getSampleText = (): string => {
    switch (tone) {
      case 'sarcastic':
        return `À vos ordres, ${userSalutation}. J'ai réglé mon coefficient d'ironie à ${sarcasmLevel}%. Essayez d'avoir des requêtes à la hauteur de mes circuits.`;
      case 'humorous':
        return `Bien reçu, ${userSalutation} ! Préparez-vous, même les ventilateurs de votre serveur dédié vont glousser.`;
      case 'tactical':
        return `Paramètres système validés pour ${userSalutation}. Tous les modules sont en ligne. Prêt à faire feu.`;
      case 'philosophical':
        return `Le code n'est que la poésie de la machine, ${userSalutation}. Notre résonance numérique est désormais ajustée.`;
      case 'classic':
      default:
        return `À votre service le plus complet, ${userSalutation}. Mes circuits vocaux et mon protocole d'assistance sont calibrés à la perfection.`;
    }
  };

  // Preview voice sample live
  const handlePlayVoiceSample = () => {
    if (isPlayingSample) {
      jarvisVoice.stopSpeaking();
      setIsPlayingSample(false);
      return;
    }

    // Apply temporary settings to voice service for testing
    jarvisVoice.updateSettings({
      preset: voicePreset,
      pitch,
      rate,
      volume,
      selectedVoiceURI,
    });

    setIsPlayingSample(true);
    jarvisVoice.speak(getSampleText(), () => {
      setIsPlayingSample(false);
    });
  };

  // Save all settings to backend and local storage
  const handleSaveAndApply = async () => {
    setIsSaving(true);
    setSaveSuccessMessage(null);

    const profile: JarvisPersonalityProfile = {
      tone,
      sarcasmLevel,
      userSalutation: userSalutation.trim() || 'Monsieur Fabrice',
      voicePreset,
      pitch,
      rate,
      volume,
      selectedVoiceURI,
    };

    try {
      // 1. Update local voice synthesizer
      jarvisVoice.updateSettings({
        preset: voicePreset,
        pitch,
        rate,
        volume,
        selectedVoiceURI,
      });

      // 2. Persist in local storage
      localStorage.setItem('jarvis_personality_profile', JSON.stringify(profile));

      // 3. Persist on Server REST API
      const result = await updateJarvisPersonality(profile);

      setSaveSuccessMessage(result.sampleReply || 'Configuration appliquée avec succès !');

      if (onPersonalityUpdated) {
        onPersonalityUpdated(profile);
      }

      // 4. Vocal confirmation from JARVIS
      jarvisVoice.speak(result.sampleReply || `Paramètres sauvegardés avec succès pour ${userSalutation}.`);

      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setSaveSuccessMessage('Sauvegarde locale effectuée (Serveur en mode réactif).');
      jarvisVoice.speak(`À vos ordres, ${userSalutation}. Paramètres de synthèse vocale actualisés.`);
    } finally {
      setIsSaving(false);
    }
  };

  const frenchVoices = browserVoices.filter(
    (v) => v.lang.startsWith('fr') || v.lang.includes('FR')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 overflow-hidden my-8">
        {/* Glow Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white font-hud font-bold">
              <Sparkles className="w-5 h-5 text-cyan-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-hud font-bold text-white tracking-wide">
                  VOIX & CARACTÈRE DE J.A.R.V.I.S.
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  CALIBRATION IA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Personnalisez le ton, l'humour, le sarcasme et la synthèse vocale pour {userSalutation}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              jarvisVoice.stopSpeaking();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-cyan-500/20 bg-slate-950/60 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('personality')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-hud font-semibold transition-all border-b-2 ${
              activeTab === 'personality'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>CARACTÈRE, HUMOUR & SARCASME</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-hud font-semibold transition-all border-b-2 ${
              activeTab === 'voice'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>SYNTHÈSE VOCALE & TIMBRE</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
          {saveSuccessMessage && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2.5 animate-fadeIn font-mono">
              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: PERSONALITY */}
          {activeTab === 'personality' && (
            <div className="space-y-6">
              {/* User Salutation Config */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-hud text-cyan-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                    <MessageSquareQuote className="w-4 h-4 text-cyan-400" />
                    Comment J.A.R.V.I.S. doit-il vous appeler ?
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Nom d'usage</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={userSalutation}
                    onChange={(e) => setUserSalutation(e.target.value)}
                    placeholder="Ex: Monsieur Fabrice"
                    className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                  {/* Preset quick pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['Monsieur Fabrice', 'Boss', 'Monsieur Stark', 'Maître', 'Capitaine'].map((sal) => (
                      <button
                        key={sal}
                        type="button"
                        onClick={() => setUserSalutation(sal)}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-mono transition-colors ${
                          userSalutation === sal
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {sal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tone Selection */}
              <div className="space-y-3">
                <label className="text-xs font-hud text-cyan-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Type de tempérament & réactivité
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tonesList.map((t) => {
                    const Icon = t.icon;
                    const isSelected = tone === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTone(t.id)}
                        className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`p-2 rounded-lg bg-gradient-to-br ${t.color} text-white shadow-md`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-hud font-bold text-white">{t.name}</div>
                              <div className="text-[11px] text-cyan-400 font-mono">{t.subtitle}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-xs font-bold shadow">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          {t.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {t.badge}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sarcasm Level Slider (Active especially when tone is sarcastic or humorous) */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-hud font-bold text-white tracking-wide uppercase">
                      Intensité du Sarcasme & Humour Piquant
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {sarcasmLevel}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sarcasmLevel}
                  onChange={(e) => setSarcasmLevel(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0% (Poli & Formel)</span>
                  <span>25% (Piquant léger)</span>
                  <span>50% (Taquinerie)</span>
                  <span>75% (Stark Classique)</span>
                  <span className="text-amber-400">100% (Cynique Maximal)</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                  <span className="text-cyan-400 font-bold">Effet en direct : </span>
                  {sarcasmLevel <= 20 && 'JARVIS reste mesuré et respectueux, avec de rares touches d’esprit.'}
                  {sarcasmLevel > 20 && sarcasmLevel <= 50 && 'JARVIS se permet des traits d’ironie bienveillants lors de requêtes simples.'}
                  {sarcasmLevel > 50 && sarcasmLevel <= 80 && 'JARVIS adopte le franc-parler de Tony Stark : vif, brillant, taquin et sans filtre inutile.'}
                  {sarcasmLevel > 80 && 'Mode sarcasme total : chaque réponse aura une pointe d’humour noir ou un clin d’œil à votre manque de repos.'}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    EXEMPLE DE RÉPONSE EN TEMPS RÉEL :
                  </span>
                  <button
                    type="button"
                    onClick={handlePlayVoiceSample}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white px-2 py-0.5 rounded bg-cyan-900/40 border border-cyan-500/30"
                  >
                    {isPlayingSample ? <Square className="w-3 h-3 text-red-400" /> : <Play className="w-3 h-3 text-cyan-400" />}
                    <span>{isPlayingSample ? 'Arrêter' : 'Écouter'}</span>
                  </button>
                </div>
                <p className="text-sm text-slate-200 font-mono italic bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20">
                  "{getSampleText()}"
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: VOICE SYNTHESIS */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Voice Presets */}
              <div className="space-y-3">
                <label className="text-xs font-hud text-cyan-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Profils vocaux intégrés
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {voicePresets.map((vp) => (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => {
                        setVoicePreset(vp.id as any);
                        setPitch(vp.defaultPitch);
                        setRate(vp.defaultRate);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        voicePreset === vp.id
                          ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-hud font-bold text-white">{vp.name}</span>
                        {voicePreset === vp.id && (
                          <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-sans">{vp.description}</p>
                      <div className="mt-2 text-[10px] font-mono text-cyan-400">
                        Hauteur: {vp.defaultPitch}x • Vitesse: {vp.defaultRate}x
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Browser Native Voices selector */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-2">
                <label className="text-xs font-hud text-cyan-300 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>Voix système détectées sur votre appareil</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {frenchVoices.length > 0
                      ? `${frenchVoices.length} voix françaises trouvées`
                      : 'Voix synthétiques par défaut'}
                  </span>
                </label>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Sélection automatique par JARVIS (Optimal)</option>
                  {frenchVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      🇫🇷 {v.name} ({v.lang})
                    </option>
                  ))}
                  {browserVoices
                    .filter((v) => !v.lang.startsWith('fr'))
                    .map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        🌐 {v.name} ({v.lang})
                      </option>
                    ))}
                </select>
              </div>

              {/* Audio Sliders: Pitch, Rate, Volume */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-5">
                {/* Pitch */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Hauteur de voix (Pitch / Timbre grave ou aigu)</span>
                    <span className="text-cyan-400 font-bold">{pitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Grave (0.5x)</span>
                    <span>Standard (1.0x)</span>
                    <span>Aigu (1.5x)</span>
                  </div>
                </div>

                {/* Speech Rate */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Débit de parole (Élocution)</span>
                    <span className="text-cyan-400 font-bold">{rate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.05"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Posé (0.7x)</span>
                    <span>Naturel (1.0x)</span>
                    <span>Rapide (1.5x)</span>
                  </div>
                </div>

                {/* Volume */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Volume sonore de sortie</span>
                    <span className="text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Test Audio Button */}
              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={handlePlayVoiceSample}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-cyan-500/40 text-cyan-300 hover:text-white font-hud text-xs tracking-wider transition-all shadow-md active:scale-95"
                >
                  {isPlayingSample ? (
                    <>
                      <Square className="w-4 h-4 text-red-400 animate-pulse" />
                      <span>INTERROMPRE LA SYNTHÈSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-cyan-400" />
                      <span>TESTER LA VOIX IMMÉDIATEMENT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Serveur JARVIS (192.168.1.98) synchronisé</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                jarvisVoice.stopSpeaking();
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-hud text-xs transition-colors"
            >
              Fermer
            </button>

            <button
              type="button"
              onClick={handleSaveAndApply}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>APPLICATION...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>SAUVEGARDER & APPLIQUER</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
