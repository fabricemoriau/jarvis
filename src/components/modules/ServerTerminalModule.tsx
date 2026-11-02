import React, { useState } from 'react';
import {
  Terminal as TerminalIcon,
  Server,
  Cpu,
  HardDrive,
  RotateCw,
  Play,
  Square,
  Activity,
  CheckCircle2,
  AlertCircle,
  Network,
  Zap,
  Settings,
} from 'lucide-react';
import { ServerTelemetry } from '../../types';

interface ServerTerminalModuleProps {
  telemetry: ServerTelemetry | null;
  onNotify: (msg: string) => void;
  onOpenServerSetup?: () => void;
}

export const ServerTerminalModule: React.FC<ServerTerminalModuleProps> = ({
  telemetry,
  onNotify,
  onOpenServerSetup,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<
    Array<{ type: 'input' | 'output'; text: string }>
  >([
    { type: 'output', text: 'JARVIS DEDICATED HOME SERVER OS 24.04 LTS (x86_64)' },
    { type: 'output', text: 'Nœud local : 192.168.1.98 • VPN WireGuard : 100.84.12.9' },
    { type: 'output', text: 'Tapez "help" ou cliquez sur un raccourci pour exécuter un diagnostic.' },
  ]);

  const [services, setServices] = useState(
    telemetry?.services || [
      { id: 'gemini-gateway', name: 'Gemini 3.8 Flash Cloud Gateway', status: 'online', port: 3000, latency: '12ms' },
      { id: 'ollama-core', name: 'Ollama Llama-3 & Mistral (Local GPU)', status: 'online', port: 11434, latency: '3ms' },
      { id: 'android-build-hub', name: 'Android Studio Headless Compiler', status: 'ready', port: 8085, latency: '1ms' },
      { id: 'photoprism-nas', name: 'Photothèque NAS Vault & Face AI', status: 'syncing', port: 2342, latency: '2ms' },
      { id: 'mail-relay', name: 'Postfix & IMAP Smart Triage Service', status: 'online', port: 993, latency: '4ms' },
      { id: 'mobile-tunnel', name: 'WireGuard Mobile Sync Gateway', status: 'online', port: 51820, latency: '8ms' },
    ]
  );

  const executeCommand = (cmd: string) => {
    const cleanCmd = cmd.trim();
    if (!cleanCmd) return;

    const newHistory = [...terminalHistory, { type: 'input' as const, text: `$ ${cleanCmd}` }];

    switch (cleanCmd.toLowerCase()) {
      case 'help':
        newHistory.push({
          type: 'output',
          text: `Commandes disponibles :\n  status      - Rapport complet de santé du serveur\n  docker ps   - Liste des conteneurs actifs\n  free -m     - Utilisation de la mémoire vive\n  df -h       - Espace disque RAID NVMe\n  adb devices - Smartphones Android connectés\n  uptime      - Temps d'activité continue\n  clear       - Effacer l'écran`,
        });
        break;
      case 'status':
        newHistory.push({
          type: 'output',
          text: `[JARVIS STATUS]\n  CPU : AMD Ryzen 9 7950X (Temp: 42°C, Charge: 22%)\n  GPU : RTX 4090 24GB (VRAM: 5.8GB / 24GB)\n  RAM : 21.4GB utilisés sur 64GB DDR5 ECC\n  Stockage : 3.2TB / 8.0TB alloués\n  Liaison mobile : Xiaomi HyperOS de Fabrice connecté (latence 6ms)`,
        });
        break;
      case 'docker ps':
        newHistory.push({
          type: 'output',
          text: `CONTAINER ID   IMAGE                 STATUS          PORTS\na81f9b32c10    ollama/llama3:8b      Up 47 days      0.0.0.0:11434->11434/tcp\nb49c104e12     android-studio-build  Up 12 days      0.0.0.0:8085->8085/tcp\nc901df499a     photoprism/vault:v26  Up 47 days      0.0.0.0:2342->2342/tcp\nd34a21019f     postfix-imap-triage   Up 47 days      0.0.0.0:993->993/tcp\ne882194b1c     wireguard-mobile-vpn  Up 47 days      0.0.0.0:51820->51820/udp`,
        });
        break;
      case 'free -m':
        newHistory.push({
          type: 'output',
          text: `               total        used        free      shared  buff/cache   available\nMem:           64320       21840       38120         410        4360       41900\nSwap:          16384           0       16384`,
        });
        break;
      case 'df -h':
        newHistory.push({
          type: 'output',
          text: `Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p2  7.6T  3.2T  4.4T  42% /nas\n/dev/nvme0n1p1  512M  128M  384M  25% /boot`,
        });
        break;
      case 'adb devices':
        newHistory.push({
          type: 'output',
          text: `List of devices attached\n192.168.1.182:5555    device    xiaomi_23127PN0CG (Xiaomi HyperOS / Android 14)`,
        });
        break;
      case 'uptime':
        newHistory.push({
          type: 'output',
          text: ` 14:22:04 up 47 days, 14:22,  1 user,  load average: 0.82, 0.94, 1.05`,
        });
        break;
      case 'clear':
        setTerminalHistory([]);
        setCommandInput('');
        return;
      default:
        newHistory.push({
          type: 'output',
          text: `jarvis-sh: Commande non reconnue : "${cleanCmd}". Tapez "help" pour voir les instructions supportées.`,
        });
        break;
    }

    setTerminalHistory(newHistory);
    setCommandInput('');
  };

  const handleRestartService = (id: string, name: string) => {
    onNotify(`Redémarrage du service Docker "${name}"...`);
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'syncing' as const } : s))
    );

    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'online' as const } : s))
      );
      onNotify(`Service "${name}" redémarré avec succès.`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl hud-glass border border-cyan-500/20">
        <div>
          <h2 className="text-lg font-hud font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>Serveur Dédié Domicile & Daemon Center</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Machine physique 100% dédiée à votre domicile • Supervision des conteneurs & console Shell
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenServerSetup && (
            <button
              onClick={onOpenServerSetup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Paramétrer Serveur Maison</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/30">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>CHARGE SYSTÈME : OPTIMALE (22%)</span>
          </div>
        </div>
      </div>

      {/* Hardware Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hud-glass p-4 rounded-xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-hud text-slate-400 uppercase">
            <span>Processeur</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white">AMD Ryzen 9 7950X</div>
          <div className="text-xs font-mono text-slate-400">16 cœurs / 32 threads @ 4.5 GHz</div>
        </div>

        <div className="hud-glass p-4 rounded-xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-hud text-slate-400 uppercase">
            <span>Mémoire Vive</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-white">64 GB DDR5-6000 ECC</div>
          <div className="text-xs font-mono text-slate-400">21.4 GB alloués (33%)</div>
        </div>

        <div className="hud-glass p-4 rounded-xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-hud text-slate-400 uppercase">
            <span>Accélérateur IA Local</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white">NVIDIA RTX 4090 24GB</div>
          <div className="text-xs font-mono text-slate-400">Ollama & Whisper en mémoire VRAM</div>
        </div>

        <div className="hud-glass p-4 rounded-xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-hud text-slate-400 uppercase">
            <span>Stockage RAID NVMe</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white">8.0 TB RAID 1 Mirroring</div>
          <div className="text-xs font-mono text-slate-400">3.2 TB occupés • 4.8 TB libres</div>
        </div>
      </div>

      {/* Quick PC Access Guide Banner */}
      <div className="hud-glass-card p-5 rounded-2xl border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-hud font-bold text-sm text-white">
                Comment Ouvrir et Contrôler le Serveur depuis ce PC
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Méthodes directes d'accès web, terminal SSH et explorateur de fichiers réseau.
              </p>
            </div>
          </div>

          {onOpenServerSetup && (
            <button
              onClick={onOpenServerSetup}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-hud border border-cyan-500/30 flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Modifier l'IP ({telemetry?.ip || '192.168.1.98'})</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Option 1 : Navigateur Web */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-hud font-bold text-cyan-300">
              <span>1. Dans votre Navigateur Web</span>
              <span className="text-[10px] font-mono text-emerald-400">HTTP</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Ouvrez un nouvel onglet Chrome/Firefox/Edge et saisissez l'adresse locale :
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-400 select-all">
              http://{telemetry?.ip || '192.168.1.98'}:3000
            </div>
          </div>

          {/* Option 2 : Terminal SSH */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-hud font-bold text-cyan-300">
              <span>2. En Ligne de Commande (SSH)</span>
              <span className="text-[10px] font-mono text-blue-400">PowerShell / Bash</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Sur Windows (PowerShell/CMD) ou Mac/Linux (Terminal) :
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-400 select-all">
              ssh fabrice@{telemetry?.ip || '192.168.1.98'}
            </div>
          </div>

          {/* Option 3 : Partage Fichiers NAS */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-hud font-bold text-cyan-300">
              <span>3. Explorateur de Fichiers (NAS)</span>
              <span className="text-[10px] font-mono text-purple-400">Samba / NFS</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Dans l'explorateur Windows, tapez dans la barre de chemin :
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-400 select-all">
              \\{telemetry?.ip || '192.168.1.98'}\nas
            </div>
          </div>
        </div>
      </div>

      {/* Docker Services Control */}
      <div className="hud-glass p-6 rounded-2xl border border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h3 className="font-hud font-bold text-sm text-white uppercase tracking-wider">
              Conteneurs Docker & Services Dédiés
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">6 Services en cours d'exécution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      svc.status === 'online'
                        ? 'bg-emerald-400'
                        : svc.status === 'syncing'
                        ? 'bg-amber-400 animate-spin'
                        : 'bg-cyan-400'
                    }`}
                  />
                  <h4 className="text-xs font-semibold text-white truncate max-w-[170px]">
                    {svc.name}
                  </h4>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Port: {svc.port} • Latence: {svc.latency}
                </div>
              </div>

              <button
                onClick={() => handleRestartService(svc.id, svc.name)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                title="Redémarrer le conteneur"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated Home Server Terminal */}
      <div className="hud-glass-card rounded-2xl border border-cyan-500/30 overflow-hidden space-y-0">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-hud text-slate-300">
            <TerminalIcon className="w-4 h-4 text-cyan-400" />
            <span>jarvis@home-server-dedicated:~$ (Console d'administration)</span>
          </div>

          {/* Quick command buttons */}
          <div className="flex items-center gap-1.5">
            {['status', 'docker ps', 'df -h', 'adb devices'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => executeCommand(cmd)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/40 text-[10px] font-mono text-cyan-300 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Console output display */}
        <div className="p-4 bg-slate-950/95 font-mono-code text-xs text-slate-300 max-h-72 overflow-y-auto space-y-1.5 leading-relaxed">
          {terminalHistory.map((item, index) => (
            <div
              key={index}
              className={`${
                item.type === 'input'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-300 whitespace-pre-wrap'
              }`}
            >
              {item.text}
            </div>
          ))}
        </div>

        {/* Input prompt line */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCommand(commandInput);
          }}
          className="flex items-center px-4 py-2 bg-slate-950 border-t border-slate-800"
        >
          <span className="text-xs font-mono text-emerald-400 mr-2 font-bold">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Tapez une commande (ex: status, docker ps, adb devices)..."
            className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-hud"
          >
            Exécuter
          </button>
        </form>
      </div>
    </div>
  );
};
