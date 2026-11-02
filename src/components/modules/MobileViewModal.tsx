import React, { useState } from 'react';
import {
  Smartphone,
  Wifi,
  Battery,
  Mic,
  MicOff,
  Mail,
  Camera,
  Code2,
  Share2,
  ShieldCheck,
  Bell,
  Send,
  Sparkles,
  QrCode,
  ArrowLeft,
  Server,
  CheckCircle2,
} from 'lucide-react';
import { ArcReactorCore } from '../ArcReactorCore';
import { jarvisVoice } from '../../services/voice';

interface MobileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  isSpeaking: boolean;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isThinking: boolean;
  onNotify: (msg: string) => void;
}

export const MobileViewModal: React.FC<MobileViewModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  isSpeaking,
  isListening,
  setIsListening,
  isThinking,
  onNotify,
}) => {
  const [mobileInput, setMobileInput] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'notifications' | 'remote' | 'qr'>('home');

  if (!isOpen) return null;

  const handleVoiceTap = () => {
    if (isListening) {
      jarvisVoice.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      jarvisVoice.startListening(
        (transcript) => {
          setIsListening(false);
          setMobileInput(transcript);
          onSendMessage(transcript);
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsListening(false);
        }
      );
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileInput.trim() || isThinking) return;
    const msg = mobileInput.trim();
    setMobileInput('');
    await onSendMessage(msg);
  };

  const notifications = [
    {
      id: 1,
      title: "Android Studio : APK Compilé",
      desc: "JarvisMobileCompanion-v2.4.1-debug.apk est prêt sur le serveur.",
      time: "Il y a 5 min",
      icon: Code2,
      color: "text-emerald-400",
    },
    {
      id: 2,
      title: "Email urgent détecté",
      desc: "Alexandre Laurent : Validation architecture domotique & VPN.",
      time: "Il y a 22 min",
      icon: Mail,
      color: "text-red-400",
    },
    {
      id: 3,
      title: "Synchronisation NAS Réussie",
      desc: "14 photos synchronisées de votre pellicule vers /nas/photos/.",
      time: "Il y a 1 heure",
      icon: Camera,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm sm:max-w-md h-[92vh] max-h-[820px] bg-slate-950 rounded-[40px] border-4 border-slate-700 shadow-2xl flex flex-col overflow-hidden ring-1 ring-cyan-500/30">
        {/* Notch / Dynamic Island */}
        <div className="w-full bg-slate-950 pt-3 px-6 flex items-center justify-between text-[11px] text-slate-300 font-mono select-none">
          <span>14:25</span>
          <div className="w-24 h-4 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px]">5G</span>
            <Battery className="w-4 h-4 text-emerald-400" />
            <span>88%</span>
          </div>
        </div>

        {/* Mobile Header Bar */}
        <div className="px-5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              title="Fermer la vue mobile"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs font-hud font-bold text-white tracking-wider flex items-center gap-1.5">
                <span>J.A.R.V.I.S. MOBILE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[9px] text-cyan-400 font-mono">
                Liaison Chiffrée (192.168.1.98)
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'qr' ? 'home' : 'qr')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300"
            title="Appairer un vrai smartphone"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {activeTab === 'home' && (
            <div className="space-y-4">
              {/* Arc Reactor on Mobile */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/40 border border-cyan-500/20">
                <ArcReactorCore
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  isThinking={isThinking}
                  onClick={handleVoiceTap}
                  size="md"
                />
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Touchez le réacteur pour dicter un ordre
                </p>
              </div>

              {/* Status Pill */}
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="text-xs text-slate-200">
                  <span className="font-hud font-bold text-cyan-300">
                    Serveur Domicile Accessible :
                  </span>{' '}
                  WireGuard actif, prêt pour vos commandes vocales.
                </div>
              </div>

              {/* Quick Remote Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() =>
                    onSendMessage("Jarvis, donne-moi le résumé de mes derniers emails urgents.")
                  }
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all active:scale-95"
                >
                  <Mail className="w-4 h-4 text-blue-400 mb-1.5" />
                  <div className="text-xs font-hud font-bold text-white">Résumer Emails</div>
                  <div className="text-[10px] text-slate-400">1 urgent en attente</div>
                </button>

                <button
                  onClick={() =>
                    onSendMessage("Jarvis, compile le projet Android Studio en tâche de fond.")
                  }
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all active:scale-95"
                >
                  <Code2 className="w-4 h-4 text-emerald-400 mb-1.5" />
                  <div className="text-xs font-hud font-bold text-white">Compiler APK</div>
                  <div className="text-[10px] text-slate-400">Gradle distant</div>
                </button>

                <button
                  onClick={() =>
                    onSendMessage("Jarvis, vérifie et classe les nouvelles photos du téléphone.")
                  }
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4 text-cyan-400 mb-1.5" />
                  <div className="text-xs font-hud font-bold text-white">Sync Photos NAS</div>
                  <div className="text-[10px] text-slate-400">Pellicule mobile</div>
                </button>

                <button
                  onClick={() =>
                    onSendMessage("Jarvis, propose-moi un post LinkedIn sur mon setup serveur dédié.")
                  }
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-purple-400 mb-1.5" />
                  <div className="text-xs font-hud font-bold text-white">Nouveau Post</div>
                  <div className="text-[10px] text-slate-400">Réseaux sociaux</div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <div className="text-xs font-hud uppercase tracking-wider text-slate-400 font-bold px-1">
                Notifications Push du Serveur Dédié
              </div>
              {notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div
                    key={notif.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-slate-800 shrink-0">
                      <Icon className={`w-4 h-4 ${notif.color}`} />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {notif.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'remote' && (
            <div className="space-y-3">
              <div className="text-xs font-hud uppercase tracking-wider text-slate-400 font-bold px-1">
                Télémétrie Distante Serveur
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hôte Domicile :</span>
                  <span className="text-cyan-300">jarvis-home-node-01</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tunnel Chiffré :</span>
                  <span className="text-emerald-400">WireGuard 100.84.12.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Charge CPU Serveur :</span>
                  <span className="text-white">22% (Ryzen 9)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stockage NAS Libre :</span>
                  <span className="text-purple-300">4.8 TB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Latence 5G vers Maison :</span>
                  <span className="text-cyan-300">14 ms</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="p-4 text-center space-y-3 bg-slate-900/60 rounded-2xl border border-cyan-500/30">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-hud font-bold text-white">
                Ouvrir sur votre Vrai Smartphone
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Scannez ce QR Code ou ouvrez l'adresse sur votre smartphone Xiaomi (Google Chrome / Mi Browser) :
              </p>

              {/* Simulated QR block */}
              <div className="p-4 bg-white rounded-xl inline-block mx-auto shadow-lg">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://ais-pre-pbjqnswa5kir5fgvyrufln-714469346607.europe-west2.run.app"
                  alt="QR Code Accès Mobile"
                  className="w-40 h-40"
                />
              </div>

              <div className="text-[11px] font-mono text-cyan-300 break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                https://ais-pre-pbjqnswa5kir5fgvyrufln-714469346607.europe-west2.run.app
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    "https://ais-pre-pbjqnswa5kir5fgvyrufln-714469346607.europe-west2.run.app"
                  );
                  onNotify("Lien copié ! Vous pouvez l'ouvrir sur votre smartphone.");
                }}
                className="w-full py-2 rounded-lg bg-cyan-500 text-slate-950 font-hud font-bold text-xs"
              >
                Copier l'URL mobile
              </button>
            </div>
          )}
        </div>

        {/* Mobile Push-to-Talk & Text Input Footer */}
        <div className="p-3 bg-slate-900/95 border-t border-slate-800 space-y-2">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              placeholder="Ordre vocal ou texte..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={handleVoiceTap}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-cyan-500 text-slate-950 font-bold'
              }`}
              title="Parler à JARVIS"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!mobileInput.trim() || isThinking}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom App Navigation */}
          <div className="flex items-center justify-around pt-1 text-slate-400 text-xs">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'home' ? 'text-cyan-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[10px] font-hud">Accueil</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex flex-col items-center gap-0.5 relative ${
                activeTab === 'notifications'
                  ? 'text-cyan-400 font-bold'
                  : 'hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="text-[10px] font-hud">Alertes</span>
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-0 right-2" />
            </button>

            <button
              onClick={() => setActiveTab('remote')}
              className={`flex flex-col items-center gap-0.5 ${
                activeTab === 'remote' ? 'text-cyan-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <Server className="w-4 h-4" />
              <span className="text-[10px] font-hud">Serveur</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
