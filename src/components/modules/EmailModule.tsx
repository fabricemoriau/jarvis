import React, { useState } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Inbox,
  AlertCircle,
  Briefcase,
  User,
  Receipt,
  Trash2,
  Star,
  RefreshCw,
  Search,
  Check,
  Bot,
  Clock,
  ArrowRight,
  Loader2,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  FileText,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  Plus,
} from 'lucide-react';
import { EmailItem, EmailRule } from '../../types';
import {
  generateEmailWithJarvis,
  analyzeEmailWithJarvis,
  fetchEmailDigest,
  triggerBatchEmailTriage,
} from '../../services/api';
import { INITIAL_EMAIL_RULES } from '../../data/mockData';
import { jarvisVoice } from '../../services/voice';

interface EmailModuleProps {
  emails: EmailItem[];
  onUpdateEmails: (emails: EmailItem[]) => void;
  onNotify: (msg: string) => void;
}

export const EmailModule: React.FC<EmailModuleProps> = ({
  emails,
  onUpdateEmails,
  onNotify,
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<'inbox' | 'rules'>('inbox');

  // Rules Engine State
  const [rules, setRules] = useState<EmailRule[]>(INITIAL_EMAIL_RULES);

  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tone, setTone] = useState('professionnel');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Executive Digest State
  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [isLoadingDigest, setIsLoadingDigest] = useState(false);
  const [digestData, setDigestData] = useState<any>(null);

  // Deep Analysis State for current email
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false);
  const [isBatchTriaging, setIsBatchTriaging] = useState(false);

  // Interactive Action Points Tracker for the selected email
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  const filteredEmails = emails.filter((email) => {
    const matchesCategory =
      activeCategory === 'all' ? true : email.category === activeCategory;
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAiReply = (email: EmailItem, prefilledIntent?: string, prefilledTone?: string) => {
    setRecipient(email.senderEmail);
    setSubject(`Re: ${email.subject}`);
    setPurpose(
      prefilledIntent || `Répondre de façon positive et technique à la demande de ${email.sender}`
    );
    setTone(prefilledTone || 'professionnel');
    setIsComposerOpen(true);
    handleGenerateDraft(
      prefilledIntent || `Répondre au message reçu : "${email.snippet}"`,
      email.body
    );
  };

  const handleGenerateDraft = async (customPurpose?: string, customContext?: string) => {
    setIsGenerating(true);
    try {
      const res = await generateEmailWithJarvis({
        recipient,
        subject,
        purpose: customPurpose || purpose || 'Répondre avec professionnalisme et clarté',
        tone,
        incomingContext: customContext || (selectedEmail ? selectedEmail.body : undefined),
      });

      if (res.data) {
        setSubject(res.data.subject || subject);
        setGeneratedBody(res.data.body || '');
        onNotify("Brouillon rédigé par JARVIS selon vos instructions.");
      }
    } catch (err: any) {
      console.error(err);
      onNotify("Erreur lors de la génération avec JARVIS : " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeepAnalyze = async () => {
    if (!selectedEmail) return;
    setIsDeepAnalyzing(true);
    try {
      const res = await analyzeEmailWithJarvis(selectedEmail);
      if (res.analysis) {
        // Update selected email in the list with fresh cognitive fields
        const updated = emails.map((e) =>
          e.id === selectedEmail.id
            ? {
                ...e,
                aiSummary: res.analysis.executiveSummary || e.aiSummary,
                urgencyScore: res.analysis.urgencyScore ?? e.urgencyScore,
                actionPoints: res.analysis.actionPoints || e.actionPoints,
                deadline: res.analysis.deadline || e.deadline,
                sentiment: res.analysis.sentiment || e.sentiment,
                suggestedAction: res.analysis.recommendedAction || e.suggestedAction,
              }
            : e
        );
        onUpdateEmails(updated);
        onNotify(`Analyse cognitive terminée : Urgence ${res.analysis.urgencyScore}%`);
      }
    } catch (err: any) {
      console.error(err);
      onNotify("Erreur d'analyse : " + err.message);
    } finally {
      setIsDeepAnalyzing(false);
    }
  };

  const handleOpenDigest = async () => {
    setIsDigestOpen(true);
    setIsLoadingDigest(true);
    try {
      const res = await fetchEmailDigest(emails);
      setDigestData(res.digest);
      onNotify("Briefing exécutif des courriels généré.");
    } catch (err: any) {
      console.error(err);
      onNotify("Erreur briefing : " + err.message);
    } finally {
      setIsLoadingDigest(false);
    }
  };

  const handleReadDigestVoice = () => {
    if (!digestData) return;
    const textToSpeak = `${digestData.greeting}. ${digestData.overview}. ${digestData.urgentPriorities?.join('. ') || ''}`;
    jarvisVoice.speak(textToSpeak);
    onNotify("Lecture vocale du briefing par JARVIS en cours...");
  };

  const handleTriggerBatchTriage = async () => {
    setIsBatchTriaging(true);
    try {
      const res = await triggerBatchEmailTriage(emails);
      onNotify(res.message || "Triage autonome Postfix & IA terminé.");
    } catch (err: any) {
      console.error(err);
      onNotify("Erreur triage : " + err.message);
    } finally {
      setIsBatchTriaging(false);
    }
  };

  const handleSendEmail = () => {
    if (!recipient || !generatedBody) return;
    setIsSending(true);

    setTimeout(() => {
      const newSentEmail: EmailItem = {
        id: `em-sent-${Date.now()}`,
        sender: 'Fabrice Moriau',
        senderEmail: 'fabrice.moriau@gmail.com',
        recipient,
        subject: subject || 'Sans objet',
        snippet: generatedBody.slice(0, 80) + '...',
        body: generatedBody,
        date: "À l'instant",
        category: 'pro',
        unread: false,
        starred: false,
        aiSummary: "Email rédigé et expédié par JARVIS via le serveur dédié Postfix.",
        urgencyScore: 25,
        sentiment: 'formal',
      };

      onUpdateEmails([newSentEmail, ...emails]);
      setIsSending(false);
      setIsComposerOpen(false);
      setRecipient('');
      setSubject('');
      setPurpose('');
      setGeneratedBody('');
      onNotify(`Courriel expédié avec succès à ${recipient} via la passerelle SMTP.`);
    }, 1200);
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateEmails(
      emails.map((item) => (item.id === id ? { ...item, starred: !item.starred } : item))
    );
  };

  const toggleRead = (id: string) => {
    onUpdateEmails(
      emails.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item))
    );
  };

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
    onNotify("Règle de filtrage mise à jour sur le serveur Postfix.");
  };

  const toggleActionCheck = (actionText: string) => {
    setCheckedActions((prev) => ({
      ...prev,
      [actionText]: !prev[actionText],
    }));
  };

  const urgentCount = emails.filter((e) => e.category === 'urgent' && e.unread).length;

  return (
    <div className="space-y-4">
      {/* Module Title & Global Action Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-xl hud-glass border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-hud font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <span>Gestionnaire d'Emails & Intelligence Postfix</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>fabrice.moriau@gmail.com</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Démon Postfix / IMAP TLS • Filtre SpamAssassin • Résumés exécutifs & Triage autonome par JARVIS
          </p>
        </div>

        {/* View Switches & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Toggle Inbox / Rules */}
          <div className="flex p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-hud">
            <button
              onClick={() => setActiveView('inbox')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === 'inbox'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Boîte ({emails.length})
            </button>
            <button
              onClick={() => setActiveView('rules')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                activeView === 'rules'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Règles ({rules.filter((r) => r.enabled).length})</span>
            </button>
          </div>

          {/* Morning Digest Button */}
          <button
            onClick={handleOpenDigest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-hud transition-all active:scale-95"
            title="Briefing matinal des courriels par JARVIS"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Briefing IA</span>
          </button>

          {/* Batch Triage Button */}
          <button
            onClick={handleTriggerBatchTriage}
            disabled={isBatchTriaging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-hud transition-all active:scale-95 disabled:opacity-50"
            title="Lancer le scan de triage autonome"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isBatchTriaging ? 'animate-spin' : ''}`} />
            <span>{isBatchTriaging ? 'Triage...' : 'Triage Auto'}</span>
          </button>

          {/* Compose with JARVIS */}
          <button
            onClick={() => {
              setRecipient('');
              setSubject('');
              setPurpose('');
              setGeneratedBody('');
              setIsComposerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Rédiger avec JARVIS</span>
          </button>
        </div>
      </div>

      {activeView === 'rules' ? (
        /* ================= RULES ENGINE VIEW ================= */
        <div className="hud-glass p-6 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-hud font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Règles d'Automatisation & Sécurité Postfix / IMAP</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                JARVIS applique ces règles 24h/24 en tâche de fond sur le serveur dédié à domicile.
              </p>
            </div>
            <button
              onClick={() => onNotify("Formulaire de création de règle prêt.")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-hud"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Règle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-hud font-bold text-white">{rule.name}</h4>
                    <span className="text-[10px] font-mono text-cyan-400">
                      Déclenchée {rule.timesTriggered} fois cette semaine
                    </span>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-hud uppercase font-bold transition-all ${
                      rule.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {rule.enabled ? 'ACTIVE' : 'DÉSACTIVÉE'}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">
                    <span className="text-cyan-400 font-bold">SI : </span>
                    <span>{rule.condition}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-emerald-400 font-bold">ALORS : </span>
                    <span>{rule.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ================= INBOX VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
          {/* Left Column: Categories + Inbox List */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 no-scrollbar">
              {[
                { id: 'all', label: 'Tous', icon: Inbox },
                {
                  id: 'urgent',
                  label: `Urgents ${urgentCount > 0 ? `(${urgentCount})` : ''}`,
                  icon: AlertCircle,
                  color: 'text-red-400',
                  badge: urgentCount > 0,
                },
                { id: 'pro', label: 'Pro', icon: Briefcase },
                { id: 'personnel', label: 'Perso', icon: User },
                { id: 'factures', label: 'Factures', icon: Receipt },
                { id: 'spam', label: 'Spam', icon: ShieldAlert },
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition-all whitespace-nowrap relative ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${cat.color || 'text-cyan-400'}`} />
                    <span>{cat.label}</span>
                    {cat.badge && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher expéditeur, objet, mots-clés..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 font-sans"
              />
            </div>

            {/* Email Item List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[580px]">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  Aucun courriel dans cette section.
                </div>
              ) : (
                filteredEmails.map((email) => {
                  const isSelected = email.id === selectedEmailId;
                  const isUrgent = email.category === 'urgent' || (email.urgencyScore && email.urgencyScore > 75);

                  return (
                    <div
                      key={email.id}
                      onClick={() => {
                        setSelectedEmailId(email.id);
                        if (email.unread) toggleRead(email.id);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/50 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {email.unread && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          )}
                          <span
                            className={`text-xs font-semibold ${
                              email.unread ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {email.sender}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">{email.date}</span>
                          <button
                            onClick={(e) => toggleStar(email.id, e)}
                            className="text-slate-500 hover:text-amber-400"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                email.starred ? 'text-amber-400 fill-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <h4
                        className={`text-xs font-medium line-clamp-1 ${
                          email.unread ? 'text-cyan-300' : 'text-slate-200'
                        }`}
                      >
                        {email.subject}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug font-sans">
                        {email.snippet}
                      </p>

                      <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-800/60 text-[10px]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded font-hud uppercase font-bold ${
                              isUrgent
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : email.category === 'factures'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : email.category === 'spam'
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                            }`}
                          >
                            {email.category}
                          </span>

                          {email.urgencyScore !== undefined && (
                            <span
                              className={`font-mono font-bold flex items-center gap-0.5 ${
                                email.urgencyScore > 75
                                  ? 'text-red-400'
                                  : email.urgencyScore > 40
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              <Flame className="w-2.5 h-2.5" />
                              <span>{email.urgencyScore}%</span>
                            </span>
                          )}
                        </div>

                        {email.aiSummary && (
                          <span className="text-cyan-400 font-mono flex items-center gap-1">
                            <Bot className="w-2.5 h-2.5" />
                            <span>Analysé</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Reader View & Cognitive Analysis */}
          <div className="lg:col-span-7 hud-glass p-6 rounded-2xl border border-cyan-500/20 flex flex-col justify-between space-y-4">
            {selectedEmail ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-white font-hud tracking-wide">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex items-center gap-2">
                      {selectedEmail.urgencyScore !== undefined && (
                        <div
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-hud font-bold border ${
                            selectedEmail.urgencyScore > 75
                              ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>Urgence : {selectedEmail.urgencyScore}%</span>
                        </div>
                      )}

                      <button
                        onClick={() => toggleRead(selectedEmail.id)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-mono"
                      >
                        {selectedEmail.unread ? 'Marquer comme lu' : 'Non lu'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
                    <div>
                      De : <span className="text-cyan-300 font-semibold">{selectedEmail.sender}</span> &lt;
                      {selectedEmail.senderEmail}&gt;
                    </div>
                    <div>{selectedEmail.date}</div>
                  </div>

                  {selectedEmail.deadline && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 w-fit">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Échéance détectée : {selectedEmail.deadline}</span>
                    </div>
                  )}
                </div>

                {/* Cognitive Summary Banner */}
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-hud uppercase tracking-wider text-cyan-300 font-bold">
                        Synthèse Cognitive & Intelligence Majordome
                      </span>
                    </div>
                    <button
                      onClick={handleDeepAnalyze}
                      disabled={isDeepAnalyzing}
                      className="text-[11px] font-hud text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50"
                      title="Relancer l'analyse avec Gemini 3.8 Flash"
                    >
                      <RefreshCw className={`w-3 h-3 ${isDeepAnalyzing ? 'animate-spin' : ''}`} />
                      <span>{isDeepAnalyzing ? 'Réflexion...' : 'Réanalyser'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {selectedEmail.aiSummary || selectedEmail.snippet}
                  </p>

                  {/* Action Points / To-Do Items Checklist */}
                  {selectedEmail.actionPoints && selectedEmail.actionPoints.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-cyan-500/20">
                      <div className="text-[11px] font-hud text-cyan-400 uppercase tracking-wider">
                        Actions requises pour Monsieur Fabrice :
                      </div>
                      <div className="space-y-1">
                        {selectedEmail.actionPoints.map((action, idx) => {
                          const isDone = checkedActions[action];
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleActionCheck(action)}
                              className={`flex items-center gap-2 text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                                isDone
                                  ? 'text-slate-500 line-through bg-slate-900/40'
                                  : 'text-slate-200 hover:bg-cyan-950/60'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                  isDone
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : 'border-slate-600'
                                }`}
                              >
                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="font-sans">{action}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 1-Click Quick Reply Suggestions */}
                  <div className="pt-2 border-t border-cyan-500/20 space-y-1.5">
                    <div className="text-[11px] font-hud text-slate-400 uppercase tracking-wider">
                      Réponses Intelligentes en 1 Clic :
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          handleOpenAiReply(
                            selectedEmail,
                            `Confirmer la demande de ${selectedEmail.sender} et valider le calendrier technique`,
                            'professionnel'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-hud transition-all active:scale-95 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmer & Valider</span>
                      </button>

                      <button
                        onClick={() =>
                          handleOpenAiReply(
                            selectedEmail,
                            `Demander un court délai de 48h à ${selectedEmail.sender} pour finaliser les tests`,
                            'cordial'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-hud transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Demander un délai</span>
                      </button>

                      <button
                        onClick={() =>
                          handleOpenAiReply(
                            selectedEmail,
                            `Solliciter des précisions techniques détaillées sur la démarche`,
                            'professionnel'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-hud transition-all active:scale-95 flex items-center gap-1"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Demander précisions</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Content Body */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-200 whitespace-pre-line leading-relaxed min-h-[160px] font-sans">
                  {selectedEmail.body}
                </div>

                {/* Action Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenAiReply(selectedEmail)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Demander à JARVIS de répondre</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onUpdateEmails(emails.filter((e) => e.id !== selectedEmail.id));
                        onNotify("Courriel archivé avec succès.");
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 text-xs font-hud transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Archiver</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-xs">
                Sélectionnez un courriel pour le consulter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Executive Digest Modal */}
      {isDigestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-2xl hud-glass-card p-6 rounded-2xl border border-purple-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-hud font-bold text-base text-white">
                  Briefing Exécutif de la Boîte Email — J.A.R.V.I.S.
                </h3>
              </div>
              <button
                onClick={() => setIsDigestOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {isLoadingDigest ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs font-mono text-slate-400">
                  Synthèse des flux Postfix et consultation de votre agenda par JARVIS...
                </p>
              </div>
            ) : digestData ? (
              <div className="space-y-4 font-sans text-xs">
                {/* Greeting */}
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200">
                  <p className="font-semibold text-sm mb-1">{digestData.greeting}</p>
                  <p className="text-slate-300 leading-relaxed">{digestData.overview}</p>
                </div>

                {/* Urgent Priorities */}
                {digestData.urgentPriorities && digestData.urgentPriorities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-hud font-bold text-red-400 uppercase text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Urgences prioritaires identifiées :</span>
                    </h4>
                    <div className="space-y-1">
                      {digestData.urgentPriorities.map((item: string, i: number) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 text-red-200 flex items-start gap-2"
                        >
                          <Flame className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Plan */}
                {digestData.suggestedPlan && (
                  <div className="space-y-2">
                    <h4 className="font-hud font-bold text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Plan d'action recommandé aujourd'hui :</span>
                    </h4>
                    <div className="space-y-1">
                      {digestData.suggestedPlan.map((step: string, i: number) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200 flex items-center gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center font-bold">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-slate-400 font-mono text-[11px]">
                  <span>Temps estimé pour traiter la boîte : ~{digestData.estimatedTimeMinutes || 4} min</span>
                  <button
                    onClick={handleReadDigestVoice}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-hud text-xs border border-cyan-500/40"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Écouter la synthèse</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Composer Modal with AI generation */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl hud-glass-card p-6 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <h3 className="font-hud font-bold text-base text-white">
                  Rédaction Intelligente d'Email avec JARVIS
                </h3>
              </div>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Destinataire
                  </label>
                  <input
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="contact@exemple.fr"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Ton du message
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="professionnel">Professionnel & Technique</option>
                    <option value="cordial">Cordial & Chaleureux</option>
                    <option value="concis">Concis & Direct (Bullet points)</option>
                    <option value="formel">Formel & Institutionnel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-hud text-slate-400 uppercase">
                  Objet du courriel
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Objet clair..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Consignes pour JARVIS
                  </label>
                  <button
                    onClick={() => handleGenerateDraft()}
                    disabled={isGenerating}
                    className="text-xs font-hud text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>Générer le texte maintenant</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Ex : Remercie Alexandre, valide le port WireGuard 51820 et propose un test de compilation demain à 14h."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-hud text-slate-400 uppercase">
                  Corps du message (modifiable)
                </label>
                <textarea
                  rows={6}
                  value={generatedBody}
                  onChange={(e) => setGeneratedBody(e.target.value)}
                  placeholder="Le texte généré apparaîtra ici..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsComposerOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-hud text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!recipient || !generatedBody || isSending}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-40"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Expédier le courriel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
