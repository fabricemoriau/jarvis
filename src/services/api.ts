import { ServerTelemetry, JarvisPersonalityProfile } from '../types';

export async function askJarvisChat(message: string, history: any[], currentModule: string, personality?: Partial<JarvisPersonalityProfile>) {
  const res = await fetch('/api/jarvis/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, currentModule, personality }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur de communication avec JARVIS');
  }
  return res.json();
}

export async function generateEmailWithJarvis(params: {
  recipient: string;
  subject: string;
  purpose: string;
  tone: string;
  incomingContext?: string;
}) {
  const res = await fetch('/api/jarvis/email/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la rédaction de l’email');
  }
  return res.json();
}

export async function generateCodeWithJarvis(params: {
  request: string;
  language?: string;
  target?: string;
}) {
  const res = await fetch('/api/jarvis/code/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la génération de code Android Studio');
  }
  return res.json();
}

export async function generatePublicationWithJarvis(params: {
  topic: string;
  platform: string;
  tone: string;
}) {
  const res = await fetch('/api/jarvis/publication/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la rédaction de la publication');
  }
  return res.json();
}

export async function fetchServerStatus(): Promise<ServerTelemetry> {
  const res = await fetch('/api/server/status');
  if (!res.ok) {
    throw new Error('Impossible de contacter le serveur dédié');
  }
  return res.json();
}

export async function fetchServerConfig() {
  const res = await fetch('/api/v1/server/config');
  if (!res.ok) {
    throw new Error('Impossible de charger la configuration du serveur');
  }
  return res.json();
}

export async function updateServerConfig(config: any) {
  const res = await fetch('/api/v1/server/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    throw new Error('Erreur lors de la sauvegarde de la configuration');
  }
  return res.json();
}

export async function analyzeEmailWithJarvis(email: any) {
  const res = await fetch('/api/jarvis/email/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de l’analyse cognitive du courriel');
  }
  return res.json();
}

export async function fetchEmailDigest(emails: any[]) {
  const res = await fetch('/api/jarvis/email/digest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la génération du briefing');
  }
  return res.json();
}

export async function triggerBatchEmailTriage(emails: any[]) {
  const res = await fetch('/api/jarvis/email/batch-triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors du triage');
  }
  return res.json();
}

export async function runCognitiveReasoning(goal: string, context?: any) {
  const res = await fetch('/api/jarvis/ai/reasoning', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, context }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors du raisonnement cognitif');
  }
  return res.json();
}

export async function importPhotosFromDrive(source: 'google_drive' | 'google_photos', folder?: string) {
  const res = await fetch('/api/v1/photos/import-drive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, folder }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de l’importation depuis Drive/Photos');
  }
  return res.json();
}

export async function syncPhotosFromXiaomi(phoneSourcePath?: string) {
  const res = await fetch('/api/v1/photos/sync-mobile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneSourcePath }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la synchronisation Xiaomi');
  }
  return res.json();
}

export async function createServerPhotoAlbum(albumName: string) {
  const res = await fetch('/api/v1/photos/create-album', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ albumName }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la création du dossier album');
  }
  return res.json();
}

export async function savePhotoToServer(photo: any) {
  const res = await fetch('/api/v1/photos/save-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de l’enregistrement du fichier photo');
  }
  return res.json();
}

export async function compileCodeWithAiStudio(params: {
  code: string;
  filename: string;
  language?: string;
  target?: string;
}) {
  const res = await fetch('/api/v1/code/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la compilation par Google AI Studio');
  }
  return res.json();
}

export async function syncCodeToGitHub(params: {
  commitMessage: string;
  files: Array<{ path: string; name: string }>;
  repo?: string;
  branch?: string;
  githubToken?: string;
}) {
  const res = await fetch('/api/v1/git/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la synchronisation GitHub');
  }
  return res.json();
}

export async function saveCodeToHomeServer(params: {
  filePath: string;
  content: string;
}) {
  const res = await fetch('/api/v1/code/save-server', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la sauvegarde sur le serveur dédié');
  }
  return res.json();
}

export async function fetchGitStatus() {
  const res = await fetch('/api/v1/git/status');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la récupération du statut Git');
  }
  return res.json();
}

export async function fetchJarvisPersonality(): Promise<{
  success: boolean;
  personality: JarvisPersonalityProfile;
  availableTones: Array<{ id: string; name: string; description: string }>;
  availableVoicePresets: Array<{ id: string; name: string }>;
}> {
  const res = await fetch('/api/v1/jarvis/personality');
  if (!res.ok) {
    throw new Error('Impossible de charger le profil de personnalité JARVIS');
  }
  return res.json();
}

export async function updateJarvisPersonality(config: Partial<JarvisPersonalityProfile>): Promise<{
  success: boolean;
  message: string;
  personality: JarvisPersonalityProfile;
  sampleReply: string;
}> {
  const res = await fetch('/api/v1/jarvis/personality', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la mise à jour de la personnalité');
  }
  return res.json();
}
