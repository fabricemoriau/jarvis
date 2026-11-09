/**
 * Advanced Voice synthesis and recognition utilities for JARVIS
 * Supports customizable voices, rate, pitch, volume, and personality tone presets.
 */

export interface VoiceSettings {
  preset: 'jarvis_classic' | 'jarvis_cyber' | 'friday' | 'karen';
  pitch: number;
  rate: number;
  volume: number;
  selectedVoiceURI: string;
}

class JarvisVoiceService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private recognition: any = null;
  private isListening: boolean = false;
  private settings: VoiceSettings = {
    preset: 'jarvis_classic',
    pitch: 0.95,
    rate: 1.05,
    volume: 1.0,
    selectedVoiceURI: '',
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jarvis_voice_settings');
      if (saved) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        } catch (e) {
          // ignore invalid persisted settings
        }
      }

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoice();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoice();
        }
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = 'fr-FR';
        this.recognition.interimResults = false;
      }
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const frVoices = voices.filter((v) => v.lang.startsWith('fr'));

    if (this.settings.selectedVoiceURI) {
      const match = voices.find((v) => v.voiceURI === this.settings.selectedVoiceURI);
      if (match) {
        this.voice = match;
        return;
      }
    }

    if (this.settings.preset === 'friday' || this.settings.preset === 'karen') {
      const female = frVoices.find(
        (v) =>
          v.name.toLowerCase().includes('julie') ||
          v.name.toLowerCase().includes('hortense') ||
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('celine') ||
          v.name.toLowerCase().includes('audrey')
      );
      this.voice = female || frVoices[0] || voices[0] || null;
    } else {
      const male = frVoices.find(
        (v) =>
          v.name.toLowerCase().includes('thomas') ||
          v.name.toLowerCase().includes('nicolas') ||
          v.name.toLowerCase().includes('paul') ||
          v.name.toLowerCase().includes('male')
      );
      this.voice = male || frVoices[0] || voices[0] || null;
    }
  }

  public updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined') {
      localStorage.setItem('jarvis_voice_settings', JSON.stringify(this.settings));
    }
    this.loadVoice();
  }

  public getSettings(): VoiceSettings {
    return this.settings;
  }

  public speak(text: string, onEnd?: () => void) {
    if (this.isMuted || !this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel();
      const cleanText = text
        .replace(/[*#_`>]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .slice(0, 350);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (this.voice) {
        utterance.voice = this.voice;
      }

      let dynamicPitch = this.settings.pitch;
      let dynamicRate = this.settings.rate;

      if (this.settings.preset === 'jarvis_cyber') {
        dynamicPitch = 0.8;
        dynamicRate = 1.15;
      } else if (this.settings.preset === 'friday') {
        dynamicPitch = 1.15;
        dynamicRate = 1.05;
      }

      utterance.rate = dynamicRate;
      utterance.pitch = dynamicPitch;
      utterance.volume = this.settings.volume;
      utterance.lang = 'fr-FR';

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public isSpeechRecognitionAvailable(): boolean {
    return !!this.recognition;
  }

  public startListening(onResult: (text: string) => void, onError?: (err: any) => void) {
    if (!this.recognition) {
      if (onError) onError(new Error("La reconnaissance vocale n'est pas supportée sur ce navigateur"));
      return;
    }

    if (this.isListening) {
      return;
    }

    try {
      this.isListening = true;
      this.recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          onResult(transcript.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (onError) onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e);
    }
  }

  public stopListening() {
    if (this.recognition) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore if not running
      }
    }
  }
}

export const jarvisVoice = new JarvisVoiceService();
