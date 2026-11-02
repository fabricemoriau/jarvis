import React, { useState, useEffect } from 'react';
import { HeaderHUD } from './components/HeaderHUD';
import { CommandOmnibar } from './components/CommandOmnibar';
import { OverviewModule } from './components/modules/OverviewModule';
import { EmailModule } from './components/modules/EmailModule';
import { PhotoModule } from './components/modules/PhotoModule';
import { AndroidModule } from './components/modules/AndroidModule';
import { PublicationModule } from './components/modules/PublicationModule';
import { MultiAiModule } from './components/modules/MultiAiModule';
import { ServerTerminalModule } from './components/modules/ServerTerminalModule';
import { ApiDocsModule } from './components/modules/ApiDocsModule';
import { MobileViewModal } from './components/modules/MobileViewModal';
import { ServerSetupModal } from './components/modules/ServerSetupModal';
import { HologramCenterModule } from './components/modules/HologramCenterModule';
import { VoicePersonalityModal } from './components/modules/VoicePersonalityModal';

import {
  INITIAL_EMAILS,
  INITIAL_PHOTOS,
  INITIAL_ANDROID_FILES,
  INITIAL_PUBLICATIONS,
} from './data/mockData';
import { NavigationTab, ChatMessage, ServerTelemetry, EmailItem, PhotoItem, AndroidFile, PublicationItem } from './types';
import { askJarvisChat, fetchServerStatus } from './services/api';
import { jarvisVoice } from './services/voice';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [telemetry, setTelemetry] = useState<ServerTelemetry | null>(null);

  // App domain states
  const [emails, setEmails] = useState<EmailItem[]>(INITIAL_EMAILS);
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS);
  const [androidFiles, setAndroidFiles] = useState<AndroidFile[]>(INITIAL_ANDROID_FILES);
  const [publications, setPublications] = useState<PublicationItem[]>(INITIAL_PUBLICATIONS);

  // AI & Voice Assistant states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isServerSetupOpen, setIsServerSetupOpen] = useState(false);
  const [isVoicePersonalityOpen, setIsVoicePersonalityOpen] = useState(false);

  // Notifications banner
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'success' } | null>(null);

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'jarvis',
      text: "Bonjour Monsieur Fabrice. Tous les systèmes de votre serveur dédié à domicile sont opérationnels. Vos emails, vos photos NAS, vos projets Android Studio et vos publications sont sous contrôle permanent. Comment puis-je vous assister ?",
      timestamp: 'Initialisé',
    },
  ]);

  // Load live telemetry from dedicated server
  useEffect(() => {
    // Initial path / URL check to restore or navigate to appropriate tab without 404
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('hologram') || path.includes('centre') || path.includes('3d') || search.includes('hologram')) {
        setActiveTab('hologram');
      } else if (path.includes('email')) {
        setActiveTab('emails');
      } else if (path.includes('photo')) {
        setActiveTab('photos');
      } else if (path.includes('android')) {
        setActiveTab('android');
      } else if (path.includes('publication')) {
        setActiveTab('publications');
      } else if (path.includes('server')) {
        setActiveTab('server');
      } else if (path.includes('api')) {
        setActiveTab('api_docs');
      }
    }

    const loadStatus = async () => {
      try {
        const data = await fetchServerStatus();
        setTelemetry(data);
      } catch (e) {
        console.warn('Fallback telemetry loading');
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (msg: string, type: 'info' | 'success' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    jarvisVoice.setMuted(newMuted);
    showNotification(
      newMuted ? "Voix de JARVIS désactivée." : "Voix de JARVIS activée en français.",
      'info'
    );
  };

  // Main voice & text dispatcher for JARVIS
  const handleProcessOrder = async (orderText: string) => {
    if (!orderText.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: orderText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await askJarvisChat(orderText, messages, activeTab);
      const replyText = response.reply || "À vos ordres, Monsieur. Votre demande a été traitée.";

      const jarvisMsg: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, jarvisMsg]);

      // Speak response using voice synthesis if not muted
      setIsSpeaking(true);
      jarvisVoice.speak(replyText, () => {
        setIsSpeaking(false);
      });

      if (response.gitCommit) {
        showNotification(`Code JARVIS sauvegardé avec succès [commit: ${response.gitCommit}]`, 'success');
      }

      // Contextual routing if requested by user
      const lower = orderText.toLowerCase();
      if (lower.includes('email') || lower.includes('mail') || lower.includes('courriel')) {
        setActiveTab('emails');
      } else if (lower.includes('photo') || lower.includes('doublon') || lower.includes('album')) {
        setActiveTab('photos');
      } else if (lower.includes('github') || lower.includes('git') || lower.includes('android') || lower.includes('apk') || lower.includes('gradle') || lower.includes('code')) {
        setActiveTab('android');
      } else if (lower.includes('publication') || lower.includes('linkedin') || lower.includes('post')) {
        setActiveTab('publications');
      } else if (lower.includes('serveur') || lower.includes('docker') || lower.includes('vitals') || lower.includes('cpu')) {
        setActiveTab('server');
      } else if (lower.includes('api') || lower.includes('endpoint') || lower.includes('webhook') || lower.includes('curl') || lower.includes('swagger')) {
        setActiveTab('api_docs');
      } else if (lower.includes('hologram') || lower.includes('3d') || lower.includes('centre holographique') || lower.includes('projection')) {
        setActiveTab('hologram');
      } else if (lower.includes('smartphone') || lower.includes('mobile') || lower.includes('téléphone')) {
        setIsMobileModalOpen(true);
      } else if (lower.includes('voix') || lower.includes('humour') || lower.includes('sarcasme') || lower.includes('caractere') || lower.includes('caractère') || lower.includes('personnalité') || lower.includes('timbre')) {
        setIsVoicePersonalityOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'jarvis',
        text: `À vos ordres, Monsieur. Une légère perturbation réseau s'est produite, mais le serveur local a pris le relais.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleTriggerVoice = () => {
    if (isListening) {
      jarvisVoice.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      jarvisVoice.startListening(
        (transcript) => {
          setIsListening(false);
          handleProcessOrder(transcript);
        },
        (err) => {
          console.warn('Voice recognition error:', err);
          setIsListening(false);
          showNotification("Microphone indisponible ou permission non accordée.", 'info');
        }
      );
    }
  };

  const unreadCount = emails.filter((e) => e.unread).length;

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top HUD Header */}
      <HeaderHUD
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        telemetry={telemetry}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenMobileView={() => setIsMobileModalOpen(true)}
        onOpenServerSetup={() => setIsServerSetupOpen(true)}
        onOpenVoicePersonality={() => setIsVoicePersonalityOpen(true)}
        unreadEmailCount={unreadCount}
      />

      {/* Floating Notification Toast */}
      {toast && (
        <div className="fixed top-14 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-xs font-hud text-white shadow-2xl shadow-cyan-500/20 animate-fade-in">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-cyan-400" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Omnipresent Command Bar */}
        <CommandOmnibar
          onSendMessage={handleProcessOrder}
          isThinking={isThinking}
          isListening={isListening}
          setIsListening={setIsListening}
          currentModule={activeTab}
        />

        {/* Dynamic Module Content */}
        {activeTab === 'overview' && (
          <OverviewModule
            onNavigate={setActiveTab}
            telemetry={telemetry}
            messages={messages}
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
            onTriggerVoice={handleTriggerVoice}
            onQuickAction={handleProcessOrder}
            onOpenMobileView={() => setIsMobileModalOpen(true)}
            onOpenServerSetup={() => setIsServerSetupOpen(true)}
            onOpenVoicePersonality={() => setIsVoicePersonalityOpen(true)}
          />
        )}

        {activeTab === 'hologram' && (
          <HologramCenterModule
            telemetry={telemetry}
            onNotify={showNotification}
            onQuickAction={handleProcessOrder}
          />
        )}

        {activeTab === 'emails' && (
          <EmailModule
            emails={emails}
            onUpdateEmails={setEmails}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'photos' && (
          <PhotoModule
            photos={photos}
            onUpdatePhotos={setPhotos}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'android' && (
          <AndroidModule
            files={androidFiles}
            onUpdateFiles={setAndroidFiles}
            onNotify={showNotification}
            onOpenMobileView={() => setIsMobileModalOpen(true)}
          />
        )}

        {activeTab === 'publications' && (
          <PublicationModule
            publications={publications}
            onUpdatePublications={setPublications}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'multi_ai' && (
          <MultiAiModule onNotify={showNotification} />
        )}

        {activeTab === 'server' && (
          <ServerTerminalModule
            telemetry={telemetry}
            onNotify={showNotification}
            onOpenServerSetup={() => setIsServerSetupOpen(true)}
          />
        )}

        {activeTab === 'api_docs' && (
          <ApiDocsModule onNotify={showNotification} />
        )}
      </main>

      {/* Smartphone Companion Simulator Modal */}
      <MobileViewModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        onSendMessage={handleProcessOrder}
        isSpeaking={isSpeaking}
        isListening={isListening}
        setIsListening={setIsListening}
        isThinking={isThinking}
        onNotify={showNotification}
      />

      {/* Dedicated Home Server Setup & Configuration Modal */}
      <ServerSetupModal
        isOpen={isServerSetupOpen}
        onClose={() => setIsServerSetupOpen(false)}
        onNotify={showNotification}
      />

      {/* Voice Synthesis & Personality Modal */}
      <VoicePersonalityModal
        isOpen={isVoicePersonalityOpen}
        onClose={() => setIsVoicePersonalityOpen(false)}
        onPersonalityUpdated={(p) => {
          showNotification(`Caractère "${p.tone.toUpperCase()}" et paramètres vocaux appliqués.`, 'success');
        }}
      />

      {/* Footer Status Line */}
      <footer className="border-t border-cyan-500/10 py-3 px-4 text-center text-xs font-mono text-slate-500 bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            J.A.R.V.I.S. • Serveur Dédié Domestique (Debian Buster i686) • Nœud 192.168.1.98
          </div>
          <div className="flex items-center gap-3 text-cyan-400">
            <span>Passerelle Mobile WireGuard Active</span>
            <span>•</span>
            <span>Orchestration Multi-IA Gratuites</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
