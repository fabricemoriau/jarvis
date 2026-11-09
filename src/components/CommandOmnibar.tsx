import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, Loader2 } from 'lucide-react';
import { jarvisVoice } from '../services/voice';

interface CommandOmnibarProps {
  onSendMessage: (text: string) => Promise<void>;
  isThinking: boolean;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  currentModule: string;
}

export const CommandOmnibar: React.FC<CommandOmnibarProps> = ({
  onSendMessage,
  isThinking,
  isListening,
  setIsListening,
  currentModule,
}) => {
  const [input, setInput] = useState('');

  const quickPrompts = [
    { label: '🎭 Calibrer voix & sarcasme', text: "Jarvis, calibre ton niveau d'humour, de sarcasme et ta voix." },
    { label: '📧 Résumer les emails reçus', text: "Jarvis, résume-moi les derniers emails importants et les urgences." },
    { label: '📱 Coder composant Android Studio', text: "Jarvis, crée un composant Jetpack Compose moderne pour afficher la télémétrie du serveur en temps réel." },
    { label: '🖼️ Nettoyer les doublons photos', text: "Jarvis, analyse les doublons dans la photothèque de mon serveur NAS et prépare un nettoyage." },
    { label: '✍️ Rédiger un post LinkedIn', text: "Jarvis, rédige un post percutant sur les avantages d'avoir son propre serveur dédié avec IA à domicile." },
    { label: '🖥️ Diagnostic serveur dédié', text: "Jarvis, donne-moi l'état de santé du serveur, la charge CPU/RAM et les conteneurs Docker actifs." },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value || isThinking) return;
    setInput('');
    await onSendMessage(value);
  };

  const toggleMic = () => {
    if (isThinking) return;

    if (isListening) {
      jarvisVoice.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    jarvisVoice.startListening(
      (transcript) => {
        setIsListening(false);
        const clean = transcript.trim();
        if (!clean) return;
        setInput(clean);
        void onSendMessage(clean);
      },
      (err) => {
        console.warn('Voice recognition error:', err);
        setIsListening(false);
      }
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-[11px] font-hud text-cyan-400 whitespace-nowrap flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Ordres rapides :</span>
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (isThinking) return;
              setInput('');
              void onSendMessage(qp.text);
            }}
            disabled={isThinking}
            className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-cyan-950/80 border border-cyan-500/25 hover:border-cyan-400 text-[11px] font-hud text-slate-300 hover:text-cyan-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {qp.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
            placeholder={
              isListening
                ? 'JARVIS vous écoute... Parlez naturellement...'
                : isThinking
                  ? 'JARVIS analyse votre demande et prépare l\'action...'
                  : 'Donnez un ordre à JARVIS (ex: « Rédige une réponse à Alexandre », « Compile l\'APK Android », « Trie les photos »)...'
            }
            className={`w-full pl-4 pr-24 py-3 rounded-xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner ${
              isListening
                ? 'border-red-500 ring-2 ring-red-500/30'
                : 'border-cyan-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
            }`}
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
                  : 'bg-slate-800/80 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300'
              }`}
              title={isListening ? "Arrêter l'écoute vocale" : "Parler à JARVIS (Reconnaissance vocale)"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Transmettre l'ordre à JARVIS"
            >
              {isThinking ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
