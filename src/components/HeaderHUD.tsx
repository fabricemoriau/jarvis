import {
  Server,
  Smartphone,
  Volume2,
  VolumeX,
  Mail,
  Camera,
  Code2,
  Share2,
  Cpu,
  Terminal,
  Layers,
  Radio,
  Webhook,
  Settings,
  Orbit,
  Sparkles,
} from 'lucide-react';
import { NavigationTab, ServerTelemetry } from '../types';

interface HeaderHUDProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  telemetry: ServerTelemetry | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenMobileView: () => void;
  onOpenServerSetup: () => void;
  onOpenVoicePersonality: () => void;
  unreadEmailCount: number;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  activeTab,
  onSelectTab,
  telemetry,
  isMuted,
  onToggleMute,
  onOpenMobileView,
  onOpenServerSetup,
  onOpenVoicePersonality,
  unreadEmailCount,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
    { id: 'overview', label: 'QG Jarvis', icon: Layers },
    { id: 'hologram', label: 'Centre Holographique', icon: Orbit },
    { id: 'emails', label: 'Emails', icon: Mail, badge: unreadEmailCount },
    { id: 'photos', label: 'Photothèque', icon: Camera },
    { id: 'android', label: 'Android Studio', icon: Code2 },
    { id: 'publications', label: 'Publications', icon: Share2 },
    { id: 'multi_ai', label: 'Hub Multi-IA', icon: Cpu },
    { id: 'server', label: 'Serveur Domicile', icon: Terminal },
    { id: 'api_docs', label: 'API JARVIS', icon: Webhook },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md">
      {/* Top micro ticker */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-cyan-500/10 text-[11px] font-hud text-slate-400 bg-slate-900/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold tracking-wider">SYSTÈME JARVIS V4.8.2</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>NODE DÉDIÉ : {telemetry?.ip || '192.168.1.98'}</span>
            <span className="text-slate-600">|</span>
            <span>UPTIME : {telemetry?.uptime || '47j 14h'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Voice & Personality button */}
          <button
            onClick={onOpenVoicePersonality}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-400/40 text-cyan-300 hover:text-white hover:border-cyan-300 transition-colors shadow-sm"
            title="Configurer la synthèse vocale, l'humour et le sarcasme de JARVIS"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-mono font-semibold">VOIX & CARACTÈRE</span>
          </button>

          {/* Server Config Settings Button */}
          <button
            onClick={onOpenServerSetup}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-cyan-500/30 text-cyan-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Paramétrer l'adresse et le réseau de votre serveur de maison"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline font-mono">PARAMÈTRES MAISON</span>
          </button>

          {/* Mobile phone sync status */}
          <button
            onClick={onOpenMobileView}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 transition-colors"
            title="Ouvrir la vue dédiée Smartphone"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline font-mono">TÉLÉPHONE RELIÉ (WIREGUARD)</span>
            <span className="md:hidden font-mono">MOBILE</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors"
            title={isMuted ? 'Activer la voix de JARVIS' : 'Couper la voix de JARVIS'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="flex items-center justify-between px-4 py-2.5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-hud font-bold text-white shadow-lg shadow-cyan-500/20">
              J
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-hud font-extrabold text-lg text-white tracking-widest hud-glow-text">
                  J.A.R.V.I.S.
                </span>
                <span className="text-[10px] uppercase font-hud px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Majordome Serveur
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Serveur Domicile dédié • Accès Mobile 24/7 • Fabrice M.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop navigation tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-cyan-500/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-hud tracking-wide transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-950 text-cyan-300' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVoicePersonality}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-hud font-semibold transition-all shadow-sm"
            title="Ajuster voix, humour et sarcasme"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Voix & Humour</span>
          </button>

          <button
            onClick={onOpenServerSetup}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-hud font-semibold transition-all"
            title="Paramétrer le serveur"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Setup Serveur</span>
          </button>

          <button
            onClick={onOpenMobileView}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-hud font-semibold shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Vue Smartphone</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row (scrollable) */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-1.5 overflow-x-auto border-t border-cyan-500/10 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-hud whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-300 bg-slate-900/50 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
