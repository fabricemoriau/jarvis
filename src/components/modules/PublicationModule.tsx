import React, { useState } from 'react';
import {
  Share2,
  Calendar,
  Sparkles,
  Send,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Clock,
  Heart,
  MessageSquare,
  Repeat,
  CheckCircle2,
  Loader2,
  Plus,
} from 'lucide-react';
import { PublicationItem } from '../../types';
import { generatePublicationWithJarvis } from '../../services/api';

interface PublicationModuleProps {
  publications: PublicationItem[];
  onUpdatePublications: (pubs: PublicationItem[]) => void;
  onNotify: (msg: string) => void;
}

export const PublicationModule: React.FC<PublicationModuleProps> = ({
  publications,
  onUpdatePublications,
  onNotify,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  // Form state
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<'linkedin' | 'twitter' | 'instagram' | 'blog'>('linkedin');
  const [tone, setTone] = useState('inspirant');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<any | null>(null);

  const filteredPublications = publications.filter((pub) => {
    if (activeFilter === 'all') return true;
    return pub.status === activeFilter;
  });

  const handleGeneratePost = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await generatePublicationWithJarvis({
        topic,
        platform,
        tone,
      });

      if (res.data) {
        setGeneratedPost(res.data);
        onNotify("Publication rédigée par JARVIS avec hashtags et créneau optimal !");
      }
    } catch (err: any) {
      console.error(err);
      onNotify("Erreur lors de la génération de publication : " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePublication = (status: 'draft' | 'scheduled' | 'published') => {
    if (!generatedPost) return;

    const newPub: PublicationItem = {
      id: `pub-${Date.now()}`,
      platform,
      topic,
      content: generatedPost.postContent,
      hashtags: generatedPost.hashtags || [],
      status,
      scheduledDate:
        status === 'scheduled'
          ? generatedPost.bestPostingTime || 'Demain à 10h00'
          : status === 'published'
          ? "À l'instant"
          : undefined,
      likes: status === 'published' ? 1 : 0,
      comments: 0,
    };

    onUpdatePublications([newPub, ...publications]);
    setIsGeneratorOpen(false);
    setGeneratedPost(null);
    setTopic('');
    onNotify(
      status === 'published'
        ? "Publication diffusée avec succès sur les réseaux !"
        : "Publication enregistrée dans le planning de JARVIS."
    );
  };

  const getPlatformIcon = (plat: string) => {
    switch (plat) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-400" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-sky-400" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl hud-glass border border-cyan-500/20">
        <div>
          <h2 className="text-lg font-hud font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <span>Gestionnaire de Publications & Réseaux Sociaux</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Planification automatique • Rédaction multi-plateforme • Suivi de l'engagement
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedPost(null);
            setIsGeneratorOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Créer un Post avec JARVIS</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 no-scrollbar">
        {[
          { id: 'all', label: 'Toutes les publications' },
          { id: 'published', label: 'Publiées' },
          { id: 'scheduled', label: 'Planifiées' },
          { id: 'draft', label: 'Brouillons' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-hud transition-all whitespace-nowrap ${
              activeFilter === f.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Publications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPublications.map((pub) => (
          <div
            key={pub.id}
            className="hud-glass-card rounded-2xl p-5 border border-cyan-500/20 flex flex-col justify-between space-y-4 hover:border-cyan-400/50 transition-all"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800">
                    {getPlatformIcon(pub.platform)}
                  </div>
                  <span className="text-xs font-hud font-bold uppercase text-slate-200">
                    {pub.platform}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-hud uppercase font-bold ${
                    pub.status === 'published'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : pub.status === 'scheduled'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {pub.status === 'published'
                    ? 'Publié'
                    : pub.status === 'scheduled'
                    ? 'Planifié'
                    : 'Brouillon'}
                </span>
              </div>

              {/* Topic */}
              <h4 className="text-xs font-semibold text-cyan-300 font-hud">
                {pub.topic}
              </h4>

              {/* Content preview */}
              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed line-clamp-6 font-sans">
                {pub.content}
              </p>

              {/* Optional image preview */}
              {pub.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-800 max-h-36">
                  <img
                    src={pub.imageUrl}
                    alt={pub.topic}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1">
                {pub.hashtags.map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.5 rounded"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer with stats / schedule */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              {pub.scheduledDate ? (
                <div className="flex items-center gap-1.5 text-[11px] text-purple-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pub.scheduledDate}</span>
                </div>
              ) : (
                <span>Brouillon non planifié</span>
              )}

              {pub.status === 'published' && (
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span>{pub.likes}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <MessageSquare className="w-3 h-3 text-blue-400" />
                    <span>{pub.comments}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl hud-glass-card p-6 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-hud font-bold text-base text-white">
                  Rédiger une Publication avec JARVIS
                </h3>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Plateforme cible
                  </label>
                  <select
                    value={platform}
                    onChange={(e: any) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="linkedin">LinkedIn (Professionnel & Technique)</option>
                    <option value="twitter">X / Twitter (Court & Percutant)</option>
                    <option value="instagram">Instagram (Visuel & Engageant)</option>
                    <option value="blog">Blog Personnel / Article</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Ton de la publication
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="inspirant">Inspirant & Visionnaire</option>
                    <option value="technique">Technique & Factuel (Serveur / Dev)</option>
                    <option value="storytelling">Storytelling & Expérience vécue</option>
                    <option value="pedagogique">Pédagogique / Astuce pratique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-hud text-slate-400 uppercase">
                  Sujet ou Idée clé
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex : Comment je gère mon serveur dédié avec l'IA et mon smartphone..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleGeneratePost}
                    disabled={!topic.trim() || isGenerating}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-hud font-bold text-xs disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Générer</span>
                  </button>
                </div>
              </div>

              {/* Generated Result Preview */}
              {generatedPost && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 mt-3">
                  <div className="flex items-center justify-between text-xs text-cyan-400 font-hud">
                    <span>Créneau suggéré par JARVIS : {generatedPost.bestPostingTime}</span>
                  </div>

                  <textarea
                    rows={6}
                    value={generatedPost.postContent}
                    onChange={(e) =>
                      setGeneratedPost({ ...generatedPost, postContent: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none font-sans"
                  />

                  {generatedPost.hashtags && (
                    <div className="flex flex-wrap gap-1">
                      {generatedPost.hashtags.map((h: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleSavePublication('draft')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-hud text-slate-300"
                    >
                      Enregistrer en brouillon
                    </button>
                    <button
                      onClick={() => handleSavePublication('scheduled')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-hud font-bold text-xs"
                    >
                      Planifier pour le créneau
                    </button>
                    <button
                      onClick={() => handleSavePublication('published')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-hud font-bold text-xs"
                    >
                      Publier immédiatement
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
