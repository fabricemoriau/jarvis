import React, { useState, useEffect } from 'react';
import {
  Server,
  Settings,
  Wifi,
  Shield,
  HardDrive,
  Cpu,
  Download,
  Copy,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Save,
  Globe,
  Radio,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { HomeServerConfig } from '../../types';
import { fetchServerConfig, updateServerConfig } from '../../services/api';

interface ServerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const ServerSetupModal: React.FC<ServerSetupModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [config, setConfig] = useState<HomeServerConfig>({
    serverName: 'fabrice-debian',
    localIp: '192.168.1.98',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    domainName: 'jarvis.maison',
    httpPort: 3000,
    sshPort: 22,
    wireguardPort: 51820,
    wireguardIp: '100.84.12.9',
    ddnsDomain: 'fabrice-jarvis-home.duckdns.org',
    storagePathNas: '/nas/vault',
    storagePathPhotos: '/nas/photos',
    storagePathAndroid: '/nas/workspace/android',
    backupSchedule: 'Tous les jours à 03h00 (Rsync + Snapshot ZFS)',
    ollamaPort: 11434,
    allowExternalMobileAccess: true,
    enableTlsSsl: true,
    adminEmail: 'fabrice.moriau@gmail.com',
    hardwareCpu: 'AMD Ryzen 9 7950X (16 cœurs / 32 threads @ 4.5GHz)',
    hardwareRam: '64 GB DDR5-6000 ECC (21.4 GB utilisés)',
    hardwareGpu: 'NVIDIA GeForce RTX 4090 24GB (Inférence locale Ollama & Whisper)',
  });

  const [activeStep, setActiveStep] = useState<'network' | 'storage' | 'security' | 'deploy' | 'test'>('network');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await fetchServerConfig();
      if (data) setConfig(data);
    } catch (e) {
      console.warn('Fallback local server config');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateServerConfig(config);
      onNotify("Paramètres du serveur domestique enregistrés et appliqués !");
    } catch (err: any) {
      onNotify("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-hud font-bold text-white flex items-center gap-2">
                <span>Configuration du Serveur Dédié Domicile</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {config.localIp}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Paramétrez l'adresse IP locale, les ports, le stockage NAS, et le tunnel mobile de votre maison.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-900/40 border-b border-slate-800 text-xs font-hud overflow-x-auto no-scrollbar">
          {[
            { id: 'network', label: '1. Réseau & IP Locale', icon: Wifi },
            { id: 'storage', label: '2. Stockage NAS & Chemins', icon: HardDrive },
            { id: 'security', label: '3. Accès Mobile & WireGuard', icon: Shield },
            { id: 'deploy', label: '4. Script d\'Installation Linux', icon: Terminal },
            { id: 'test', label: '5. Test Connexion Directe', icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStep === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStep(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeStep === 'network' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300">
                <span className="font-hud font-bold text-cyan-300">Emplacement réseau dans votre maison :</span>{' '}
                Configurez l'adresse IP statique attribuée à votre machine par votre box Internet (ex: Freebox, Livebox, Bbox).
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Nom d'Hôte du Serveur (Hostname)
                  </label>
                  <input
                    type="text"
                    value={config.serverName}
                    onChange={(e) => setConfig({ ...config, serverName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Adresse IP Statique sur le LAN
                  </label>
                  <input
                    type="text"
                    value={config.localIp}
                    onChange={(e) => setConfig({ ...config, localIp: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Passerelle Box Internet (Gateway)
                  </label>
                  <input
                    type="text"
                    value={config.gateway}
                    onChange={(e) => setConfig({ ...config, gateway: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Masque de Sous-Réseau
                  </label>
                  <input
                    type="text"
                    value={config.subnetMask}
                    onChange={(e) => setConfig({ ...config, subnetMask: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Port Web & API JARVIS
                  </label>
                  <input
                    type="number"
                    value={config.httpPort}
                    onChange={(e) => setConfig({ ...config, httpPort: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Port SSH d'Administration
                  </label>
                  <input
                    type="number"
                    value={config.sshPort}
                    onChange={(e) => setConfig({ ...config, sshPort: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 'storage' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300">
                <span className="font-hud font-bold text-cyan-300">Organisation des disques & dossiers NAS :</span>{' '}
                Définissez les répertoires physiques montés sur votre serveur pour la photothèque, les projets Android et la sauvegarde miroir.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Répertoire Racine Coffre NAS
                  </label>
                  <input
                    type="text"
                    value={config.storagePathNas}
                    onChange={(e) => setConfig({ ...config, storagePathNas: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Dossier des Photos Synchronisées depuis Mobile
                  </label>
                  <input
                    type="text"
                    value={config.storagePathPhotos}
                    onChange={(e) => setConfig({ ...config, storagePathPhotos: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Espace de Travail & Builds Android Studio
                  </label>
                  <input
                    type="text"
                    value={config.storagePathAndroid}
                    onChange={(e) => setConfig({ ...config, storagePathAndroid: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Fréquence des Sauvegardes Automatiques
                  </label>
                  <input
                    type="text"
                    value={config.backupSchedule}
                    onChange={(e) => setConfig({ ...config, backupSchedule: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 'security' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300">
                <span className="font-hud font-bold text-cyan-300">Liaison Smartphone 24h/24 :</span>{' '}
                Permet à JARVIS de recevoir vos requêtes vocales depuis votre téléphone portable même lorsque vous êtes hors de votre domicile.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Port WireGuard VPN (UDP)
                  </label>
                  <input
                    type="number"
                    value={config.wireguardPort}
                    onChange={(e) => setConfig({ ...config, wireguardPort: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    IP Virtuelle du Serveur sur le Tunnel WireGuard
                  </label>
                  <input
                    type="text"
                    value={config.wireguardIp}
                    onChange={(e) => setConfig({ ...config, wireguardIp: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Nom de Domaine Dynamique (DuckDNS / No-IP)
                  </label>
                  <input
                    type="text"
                    value={config.ddnsDomain}
                    onChange={(e) => setConfig({ ...config, ddnsDomain: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-hud text-slate-400 uppercase">
                    Email d'Alerte Administrateur
                  </label>
                  <input
                    type="email"
                    value={config.adminEmail}
                    onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allowExternalMobileAccess}
                    onChange={(e) => setConfig({ ...config, allowExternalMobileAccess: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300">
                    Autoriser la synchronisation des photos et ordres vocaux hors du domicile (via WireGuard)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableTlsSsl}
                    onChange={(e) => setConfig({ ...config, enableTlsSsl: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300">
                    Activer le chiffrement TLS / HTTPS Let's Encrypt sur le serveur
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeStep === 'deploy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                <span className="font-hud font-bold">Script d'Installation Automatisé :</span> Ce script prêt à l'emploi configure Ubuntu, Docker, Ollama, WireGuard et le service d'arrière-plan JARVIS sur votre serveur dédié en une seule commande.
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono-code text-xs text-slate-300 space-y-2">
                <div className="text-slate-400"># Commande à coller sur votre serveur dédié domestique (SSH) :</div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
                  <code>curl -fsSL http://{config.localIp}:{config.httpPort}/api/v1/server/install-script | bash</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`curl -fsSL http://${config.localIp}:${config.httpPort}/api/v1/server/install-script | bash`);
                      onNotify("Commande copiée ! Collez-la dans le terminal de votre serveur.");
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copier"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href="/api/v1/server/install-script"
                  download="install-jarvis-home-server.sh"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le script install-jarvis.sh</span>
                </a>
              </div>
            </div>
          )}

          {activeStep === 'test' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300">
                <span className="font-hud font-bold text-cyan-300">Test de Connexion & Diagnostic Serveur :</span>{' '}
                JARVIS vérifie la connectivité directe avec votre machine domestique ({config.localIp}:{config.httpPort}), le tunnel WireGuard et les démons en écoute.
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    setIsTestingConnection(true);
                    setTestResult(null);
                    try {
                      const res = await fetch('/api/v1/server/test-connection', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          targetIp: config.localIp,
                          port: config.httpPort,
                        }),
                      });
                      const data = await res.json();
                      setTestResult(data);
                      onNotify("Diagnostic de connexion effectué avec succès !");
                    } catch (e: any) {
                      setTestResult({
                        success: false,
                        error: e.message,
                      });
                    } finally {
                      setIsTestingConnection(false);
                    }
                  }}
                  disabled={isTestingConnection}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingConnection ? 'Analyse de la connexion en cours...' : 'Lancer le Test de Connexion Immédiat'}</span>
                </button>
              </div>

              {testResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-hud font-bold text-emerald-400">
                        SERVEUR DOMESTIQUE ACCESSIBLE & SYNCHRONISÉ
                      </span>
                    </div>
                    <span className="text-xs font-mono text-cyan-300">
                      Latence : {testResult.latencyMs} ms
                    </span>
                  </div>

                  <div className="space-y-2">
                    {testResult.checks?.map((check: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-200">{check.name}</span>
                        </div>
                        <span className="text-cyan-300 text-[11px]">{check.detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="text-cyan-400 font-bold uppercase font-hud">Recommandations de JARVIS :</div>
                    {testResult.recommendations?.map((rec: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-slate-300">
                        <span>•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Nœud : <span className="text-cyan-300">{config.serverName}</span> ({config.localIp})
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-hud text-slate-300"
            >
              Fermer
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Enregistrement...' : 'Appliquer la configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
