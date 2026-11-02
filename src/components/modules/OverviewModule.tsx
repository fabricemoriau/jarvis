import React from 'react';
import {
  Mail,
  Camera,
  Code2,
  Share2,
  Server,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldCheck,
  Bot,
  Zap,
  Settings,
  Orbit,
  Sparkles,
} from 'lucide-react';
import { ArcReactorCore } from '../ArcReactorCore';
import { ChatMessage, NavigationTab, ServerTelemetry } from '../../types';

interface OverviewModuleProps {
  onNavigate: (tab: NavigationTab) => void;
  telemetry: ServerTelemetry | null;
  messages: ChatMessage[];
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  onTriggerVoice: () => void;
  onQuickAction: (command: string) => void;
  onOpenMobileView: () => void;
  onOpenServerSetup?: () => void;
  onOpenVoicePersonality?: () => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({
  onNavigate,
  telemetry,
  messages,
  isSpeaking,
  isListening,
  isThinking,
  onTriggerVoice,
  onQuickAction,
  onOpenMobileView,
  onOpenServerSetup,
  onOpenVoicePersonality,
}) => {
  const lastJarvisMessage = [...messages].reverse().find((m) => m.sender === 'jarvis');

  return (
    <div className="space-y-6">
      {/* Hero Hologram Section */}
      <div className="relative overflow-hidden rounded-2xl hud-glass-card p-6 md:p-8 border border-cyan-500/25">
        <div className="hud-grid absolute inset-0 opacity-40 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Arc Reactor Core Centerpiece */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
            <ArcReactorCore
              isSpeaking={isSpeaking}
              isListening={isListening}
              isThinking={isThinking}
              onClick={onTriggerVoice}
              size="lg"
            />
            <p className="mt-2 text-xs text-slate-400 font-mono">
              Cliquez pour activer le canal vocal direct
            </p>
            <button
              onClick={() => onNavigate('hologram')}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-xs font-hud text-cyan-300 transition-all hover:scale-105 shadow-md shadow-cyan-950/40"
            >
              <Orbit className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span>Ouvrir Centre Holographique 3D</span>
            </button>
          </div>

          {/* Butler Status Dialogue */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-hud font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  SOUVERAINETÉ 100% LOCALE & SÉCURISÉE
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-hud font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  MAJORDOME OPÉRATIONNEL
                </span>
              </div>

              <div className="flex items-center gap-3">
                {onOpenServerSetup && (
                  <button
                    onClick={onOpenServerSetup}
                    className="flex items-center gap-1.5 text-xs font-hud text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Paramétrer Serveur Maison</span>
                  </button>
                )}

                <button
                  onClick={onOpenMobileView}
                  className="flex items-center gap-1.5 text-xs font-hud text-cyan-300 hover:text-white transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Statut Mobile : Synchronisé</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/30 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-hud uppercase tracking-wider text-cyan-400 font-bold">
                    Rapport de JARVIS à Monsieur Fabrice :
                  </h3>
                  <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">
                    {lastJarvisMessage
                      ? lastJarvisMessage.text
                      : "Bonjour Monsieur. Votre serveur dédié domestique fonctionne à des températures idéales (42°C). Vos emails urgents ont été analysés, la photothèque est synchronisée avec votre smartphone et le projet Android Studio est prêt pour une nouvelle compilation."}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onOpenServerSetup && (
                <button
                  onClick={onOpenServerSetup}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-xs font-hud text-cyan-300 transition-all active:scale-95 shadow-md shadow-cyan-950/40"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                  <span>Paramètres Réseau & Maison</span>
                </button>
              )}

              {onOpenVoicePersonality && (
                <button
                  onClick={onOpenVoicePersonality}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-950/70 via-slate-900 to-cyan-950/70 hover:from-amber-900/80 hover:to-cyan-900/80 border border-amber-500/40 text-xs font-hud text-amber-300 hover:text-white transition-all active:scale-95 shadow-md shadow-amber-950/30"
                  title="Choisir la voix, l'humour ou le sarcasme de J.A.R.V.I.S."
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Voix, Humour & Sarcasme</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('hologram')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400/50 text-xs font-hud text-cyan-200 transition-all active:scale-95 shadow-md shadow-cyan-950/40"
              >
                <Orbit className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                <span>Centre Holographique 3D</span>
              </button>

              <button
                onClick={() => onNavigate('emails')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-xs font-hud text-cyan-300 transition-all active:scale-95"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Traiter les emails (1 urgent)</span>
              </button>

              <button
                onClick={() => onNavigate('android')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-xs font-hud text-cyan-300 transition-all active:scale-95"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Android Studio & Compiler APK</span>
              </button>

              <button
                onClick={() => onNavigate('photos')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-xs font-hud text-cyan-300 transition-all active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Photos NAS (1 doublon détecté)</span>
              </button>

              <button
                onClick={() => onNavigate('publications')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-xs font-hud text-cyan-300 transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Publications Réseaux Sociaux</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task & Telemetry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Email card */}
        <div
          onClick={() => onNavigate('emails')}
          className="hud-glass p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/60 cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
              <Mail className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-hud bg-red-500/20 text-red-300 border border-red-500/30">
              1 URGENT
            </span>
          </div>
          <h4 className="text-xs font-hud uppercase tracking-wider text-slate-400">Courriels & Triage IA</h4>
          <p className="text-xl font-hud font-bold text-white mt-1">3 Nouveaux</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            Dernier : « Validation architecture serveur & API »
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-400 font-hud">
            <span>Ouvrir la boîte</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Photothèque card */}
        <div
          onClick={() => onNavigate('photos')}
          className="hud-glass p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/60 cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
              <Camera className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-hud bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              NAS SYNCHRO
            </span>
          </div>
          <h4 className="text-xs font-hud uppercase tracking-wider text-slate-400">Photothèque & Médias</h4>
          <p className="text-xl font-hud font-bold text-white mt-1">1,482 Clichés</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            2.1 TB stockés • Indexation faciale active
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-400 font-hud">
            <span>Explorer les albums</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Android Studio card */}
        <div
          onClick={() => onNavigate('android')}
          className="hud-glass p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/60 cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-hud bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              BUILD OK
            </span>
          </div>
          <h4 className="text-xs font-hud uppercase tracking-wider text-slate-400">Android Studio Hub</h4>
          <p className="text-xl font-hud font-bold text-white mt-1">APK v2.4.1 Signé</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            Jarvis Mobile Companion (0 crash)
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-400 font-hud">
            <span>Éditeur & Compilation</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Social / Publications card */}
        <div
          onClick={() => onNavigate('publications')}
          className="hud-glass p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/60 cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-hud bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PLANIFIÉ
            </span>
          </div>
          <h4 className="text-xs font-hud uppercase tracking-wider text-slate-400">Publications & Réseaux</h4>
          <p className="text-xl font-hud font-bold text-white mt-1">3 Posts Actifs</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            142 réactions LinkedIn • 1 post programmé
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-400 font-hud">
            <span>Gérer le calendrier</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Server Hardware & Mobile Gateway Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dedicated Server Node Vitals */}
        <div className="lg:col-span-7 hud-glass p-6 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h3 className="font-hud font-bold text-sm text-white uppercase tracking-wider">
                Vitals du Serveur Dédié Domicile
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              192.168.1.98 • Actif
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] font-hud text-slate-400">CPU RYZEN 9</div>
              <div className="text-lg font-mono font-bold text-cyan-300 mt-0.5">
                {telemetry?.liveMetrics.cpuPercent ?? 24}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${telemetry?.liveMetrics.cpuPercent ?? 24}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] font-hud text-slate-400">RAM DDR5 64GB</div>
              <div className="text-lg font-mono font-bold text-blue-300 mt-0.5">
                {telemetry?.liveMetrics.ramPercent ?? 34}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${telemetry?.liveMetrics.ramPercent ?? 34}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] font-hud text-slate-400">RTX 4090 VRAM</div>
              <div className="text-lg font-mono font-bold text-emerald-300 mt-0.5">
                {telemetry?.liveMetrics.gpuPercent ?? 22}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${telemetry?.liveMetrics.gpuPercent ?? 22}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] font-hud text-slate-400">TEMPÉRATURE</div>
              <div className="text-lg font-mono font-bold text-purple-300 mt-0.5">
                {telemetry?.liveMetrics.tempCelsius ?? 42}°C
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full w-2/5" />
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
            <span>RAID NVMe : 3.2 TB / 8.0 TB (40%)</span>
            <span>Débit Fibre : 124 Mbps Down • 42 Mbps Up</span>
          </div>
        </div>

        {/* Right: Mobile Phone Remote Link Card */}
        <div className="lg:col-span-5 hud-glass p-6 rounded-2xl border border-cyan-500/20 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <h3 className="font-hud font-bold text-sm text-white uppercase tracking-wider">
                  Accès Mobile Permanent
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-hud bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CONNECTÉ 24/7
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Votre smartphone est synchronisé avec le serveur dédié via le tunnel WireGuard chiffré. JARVIS exécute vos requêtes où que vous soyez dans le monde.
            </p>

            <div className="space-y-1.5 font-mono text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Appareil :</span>
                <span className="text-cyan-300">Xiaomi HyperOS (Fabrice)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Batterie :</span>
                <span className="text-emerald-400">88% (Tâche de fond active)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tunnel :</span>
                <span className="text-slate-200">WireGuard (100.84.12.9)</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onOpenMobileView}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20"
            >
              <Smartphone className="w-4 h-4" />
              <span>Ouvrir l'Interface de l'Application Mobile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
