import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Clock,
  CheckCircle2,
  Play,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
  Plus,
  Brain,
  Workflow,
  Database,
  Terminal,
  Activity,
  UserCheck,
  Bot,
  Lightbulb,
  Radio,
  Loader2,
  Search,
} from 'lucide-react';
import { AiModelNode, AutomationTask, CognitiveMemory, CognitivePlanStep } from '../../types';
import {
  AI_MODELS_MATRIX,
  AUTOMATION_TASKS,
  INITIAL_COGNITIVE_MEMORIES,
} from '../../data/mockData';
import { runCognitiveReasoning } from '../../services/api';
import { jarvisVoice } from '../../services/voice';

interface MultiAiModuleProps {
  onNotify: (msg: string) => void;
}

export const MultiAiModule: React.FC<MultiAiModuleProps> = ({ onNotify }) => {
  const [activeSubTab, setActiveSubTab] = useState<'cortex' | 'matrix' | 'memory' | 'daemons'>('cortex');

  const [models] = useState<AiModelNode[]>(AI_MODELS_MATRIX);
  const [tasks, setTasks] = useState<AutomationTask[]>(AUTOMATION_TASKS);
  const [memories, setMemories] = useState<CognitiveMemory[]>(INITIAL_COGNITIVE_MEMORIES);

  // New Memory Modal / Inline Input
  const [newMemTitle, setNewMemTitle] = useState('');
  const [newMemDetail, setNewMemDetail] = useState('');
  const [newMemCategory, setNewMemCategory] = useState<'preference' | 'contact' | 'server' | 'habit' | 'project'>('preference');
  const [isAddingMemory, setIsAddingMemory] = useState(false);

  // Cognitive Reasoning State
  const [reasoningGoal, setReasoningGoal] = useState(
    'Analyse les urgences emails de ce matin, vérifie si l\'APK Android a été compilé, et prépare une alerte pour mon Xiaomi.'
  );
  const [isReasoning, setIsReasoning] = useState(false);
  const [reasoningResult, setReasoningResult] = useState<{
    thoughtChain: string[];
    plan: CognitivePlanStep[];
    consensusSummary: string;
    finalReport: string;
    proactiveSuggestion: string;
  } | null>(null);

  // Comparator state
  const [comparePrompt, setComparePrompt] = useState('Quel est le rôle d\'un majordome IA sur serveur dédié ?');
  const [isComparing, setIsComparing] = useState(false);
  const [compareResults, setCompareResults] = useState<{
    gemini?: string;
    mistral?: string;
    llama?: string;
  } | null>(null);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
    onNotify("Configuration de la tâche automatisée mise à jour.");
  };

  const handleRunCognitiveReasoning = async () => {
    if (!reasoningGoal.trim() || isReasoning) return;
    setIsReasoning(true);
    setReasoningResult(null);

    try {
      const res = await runCognitiveReasoning(reasoningGoal, {
        serverIp: '192.168.1.98',
        mobileDevice: 'Xiaomi HyperOS (Fabrice)',
      });

      if (res.reasoning) {
        setReasoningResult(res.reasoning);
        onNotify("Cycle de réflexion cognitive multi-agents achevé.");
      }
    } catch (err: any) {
      console.error(err);
      onNotify("Erreur lors de la réflexion cognitive : " + err.message);
    } finally {
      setIsReasoning(false);
    }
  };

  const handleSpeakReport = () => {
    if (!reasoningResult) return;
    jarvisVoice.speak(reasoningResult.finalReport);
    onNotify("Lecture du rapport par JARVIS en cours...");
  };

  const handleRunComparison = () => {
    setIsComparing(true);
    setTimeout(() => {
      setCompareResults({
        gemini: "En tant que majordome IA, mon rôle est d'orchestrer la souveraineté numérique de votre foyer : filtrer vos courriels, maintenir vos sauvegardes photographiques, compiler vos applications Android et diffuser vos publications tout en restant accessible 24h/24 via votre smartphone.",
        mistral: "À vos ordres, Monsieur. Je centralise vos tâches sur votre serveur dédié : 100% privé, sans abonnement, toujours disponible depuis votre mobile.",
        llama: "Monsieur Fabrice, je veille sur votre infrastructure domestique, assure le traitement instantané de vos flux de données et garantis la confidentialité totale de vos échanges.",
      });
      setIsComparing(false);
      onNotify("Comparaison multi-IA terminée avec succès.");
    }, 1200);
  };

  const handleAddMemory = () => {
    if (!newMemTitle || !newMemDetail) return;
    const newEntry: CognitiveMemory = {
      id: `mem-${Date.now()}`,
      category: newMemCategory,
      title: newMemTitle,
      detail: newMemDetail,
      confidence: 100,
      lastUpdated: "À l'instant",
    };
    setMemories([newEntry, ...memories]);
    setNewMemTitle('');
    setNewMemDetail('');
    setIsAddingMemory(false);
    onNotify("Nouvelle connaissance mémorisée dans le cortex de JARVIS.");
  };

  return (
    <div className="space-y-6">
      {/* Title Bar & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-xl hud-glass border border-cyan-500/20">
        <div>
          <h2 className="text-lg font-hud font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span>Cortex d'Intelligence Autonome & Multi-Agents</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Orchestration cognitive : Gemini 3.8 Flash (Cloud) + RTX 4090 Ollama (Local) • Mémoire épisodique & Raisonnement continu
          </p>
        </div>

        {/* Subtabs selector */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-hud">
          {[
            { id: 'cortex', label: 'Cortex Cognitif', icon: Workflow },
            { id: 'matrix', label: 'Matrice Multi-IA', icon: Cpu },
            { id: 'memory', label: 'Mémoire & Profil', icon: Database },
            { id: 'daemons', label: 'Sentinelles 24/7', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 1. CORTEX COGNITIF & LIVE REASONING ================= */}
      {activeSubTab === 'cortex' && (
        <div className="space-y-6">
          {/* Cognitive Live Reasoning Sandbox */}
          <div className="hud-glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-cyan-400" />
                <h3 className="font-hud font-bold text-sm text-white uppercase tracking-wider">
                  Banc de Raisonnement Multi-Agents & Décomposition d'Ordres
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                Mode Réflexion Profonde Actif
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Formulez un ordre complexe pour Monsieur Fabrice : JARVIS active sa chaîne de pensée (Perception → Décomposition multi-modules → Exécution des outils réels → Synthèse exécutif).
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={reasoningGoal}
                onChange={(e) => setReasoningGoal(e.target.value)}
                placeholder="Ex : Analyse mes emails, rédige la réponse à Alexandre et vérifie la température du serveur..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              />

              <button
                onClick={handleRunCognitiveReasoning}
                disabled={isReasoning || !reasoningGoal.trim()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
              >
                {isReasoning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Raisonnement en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Déclencher le Raisonnement</span>
                  </>
                )}
              </button>
            </div>

            {/* Reasoning Output Results */}
            {reasoningResult && (
              <div className="pt-4 border-t border-slate-800 space-y-5 animate-fade-in font-sans">
                {/* 1. Thought Chain */}
                <div className="space-y-2">
                  <h4 className="text-xs font-hud font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span>Chaîne de Pensée Interne de JARVIS :</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {reasoningResult.thoughtChain.map((thought, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{thought}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Multi-Agent Plan Execution */}
                <div className="space-y-2">
                  <h4 className="text-xs font-hud font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Workflow className="w-4 h-4 text-emerald-400" />
                    <span>Exécution Coordonnée des Sous-Agents :</span>
                  </h4>
                  <div className="space-y-2">
                    {reasoningResult.plan.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded font-hud font-bold text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {step.subAgent}
                            </span>
                            <span className="font-semibold text-white">{step.action}</span>
                          </div>
                          {step.outputSnippet && (
                            <p className="text-slate-400 font-mono text-[11px] pl-1">
                              → Résultat : {step.outputSnippet}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            Outil : {step.toolUsed}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-hud uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Effectué</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Final Report & Proactive Suggestion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-hud uppercase font-bold text-cyan-300 flex items-center gap-1">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        <span>Compte-rendu pour Monsieur Fabrice :</span>
                      </span>
                      <button
                        onClick={handleSpeakReport}
                        className="text-[11px] font-hud text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <span>Écouter</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{reasoningResult.finalReport}"
                    </p>
                    <p className="text-[10px] font-mono text-cyan-400 pt-1">
                      Consensus : {reasoningResult.consensusSummary}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                    <span className="text-xs font-hud uppercase font-bold text-purple-300 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 text-purple-400" />
                      <span>Initiative Proactive Anticipée :</span>
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {reasoningResult.proactiveSuggestion}
                    </p>
                    <button
                      onClick={() => onNotify("Ordre proactif validé et programmé.")}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-hud transition-all active:scale-95"
                    >
                      Valider cette suggestion
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. MATRICE MULTI-IA & COMPARATEUR ================= */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className="hud-glass-card rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-hud uppercase font-bold ${
                        model.type === 'local'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {model.type === 'local' ? 'Serveur Local Domicile' : 'Cloud Free Tier'}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      Latence: {model.latency}
                    </span>
                  </div>

                  <h3 className="text-sm font-hud font-bold text-white tracking-wide">
                    {model.name}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {model.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Coût :</span>
                    <span className="text-emerald-400 font-bold">{model.cost}</span>
                  </div>
                  {model.vramUsage && (
                    <div className="flex justify-between text-slate-400">
                      <span>Charge VRAM RTX :</span>
                      <span className="text-cyan-300">{model.vramUsage}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Spécialité :</span>
                    <span className="text-slate-200 text-right truncate pl-2">{model.specialty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Side-by-side Multi-AI Comparison Sandbox */}
          <div className="hud-glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-hud font-bold text-sm text-white uppercase tracking-wider">
                  Banc de Test & Comparaison Directe des IA
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Orchestré par JARVIS</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={comparePrompt}
                onChange={(e) => setComparePrompt(e.target.value)}
                placeholder="Posez une question pour comparer les réponses simultanément..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              />

              <button
                onClick={handleRunComparison}
                disabled={isComparing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isComparing ? 'Génération...' : 'Lancer le test'}</span>
              </button>
            </div>

            {compareResults && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 animate-fade-in font-sans text-xs">
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                  <div className="font-hud font-bold text-cyan-300 uppercase text-[11px] flex items-center justify-between">
                    <span>Google Gemini 3.8 Flash</span>
                    <span className="font-mono text-emerald-400">12ms</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{compareResults.gemini}</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <div className="font-hud font-bold text-purple-300 uppercase text-[11px] flex items-center justify-between">
                    <span>Mistral 7B Instruct (RTX 4090)</span>
                    <span className="font-mono text-purple-400">4ms</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{compareResults.mistral}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="font-hud font-bold text-emerald-300 uppercase text-[11px] flex items-center justify-between">
                    <span>Meta Llama 3 8B (RTX 4090)</span>
                    <span className="font-mono text-emerald-400">3ms</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{compareResults.llama}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 3. MÉMOIRE COGNITIVE & PROFIL ================= */}
      {activeSubTab === 'memory' && (
        <div className="space-y-6">
          <div className="hud-glass-card p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-hud font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Registre de Mémoire Long Terme & Préférences de Monsieur Fabrice</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  JARVIS utilise cette mémoire épisodique pour adapter ses réponses, ses priorités de courriels et ses notifications mobiles.
                </p>
              </div>

              <button
                onClick={() => setIsAddingMemory(!isAddingMemory)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-hud transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une Connaissance</span>
              </button>
            </div>

            {/* Add memory form */}
            {isAddingMemory && (
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-hud text-slate-400 uppercase">Catégorie</label>
                    <select
                      value={newMemCategory}
                      onChange={(e) => setNewMemCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="preference">Préférence de communication</option>
                      <option value="contact">Contact prioritaire</option>
                      <option value="server">Paramètre Serveur Debian</option>
                      <option value="habit">Habitude & Mobile Xiaomi</option>
                      <option value="project">Projet en cours</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-hud text-slate-400 uppercase">Titre</label>
                    <input
                      type="text"
                      value={newMemTitle}
                      onChange={(e) => setNewMemTitle(e.target.value)}
                      placeholder="Ex : Fréquence de sauvegarde ZFS"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">Détail mémorisé</label>
                  <textarea
                    rows={2}
                    value={newMemDetail}
                    onChange={(e) => setNewMemDetail(e.target.value)}
                    placeholder="Ce que JARVIS doit retenir en permanence..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingMemory(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-hud text-slate-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddMemory}
                    disabled={!newMemTitle || !newMemDetail}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-bold text-xs"
                  >
                    Mémoriser
                  </button>
                </div>
              </div>
            )}

            {/* Memory items grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-hud uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {mem.category}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      Confiance : {mem.confidence}%
                    </span>
                  </div>

                  <h4 className="text-xs font-hud font-bold text-white">{mem.title}</h4>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{mem.detail}</p>
                  <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                    Mis à jour : {mem.lastUpdated}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. SENTINELLES & DAEMONS 24/7 ================= */}
      {activeSubTab === 'daemons' && (
        <div className="space-y-6">
          <div className="hud-glass-card p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-hud font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Sentinelles Autonomes & Tâches 24/7 sur Serveur Debian</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Ces daemons tournent sans interruption sur votre nœud local et déclenchent des pushs sur votre Xiaomi.
              </p>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">{task.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {task.schedule}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
                      <span>Dernière exécution : {task.lastRun}</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Statut : {task.status}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-hud font-bold transition-all ${
                      task.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {task.enabled ? 'ACTIF 24/7' : 'EN PAUSE'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
