import { ServerTelemetry, JarvisPersonalityProfile } from '../types';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function requestJson<T>(
  input: string,
  init: RequestInit = {},
  timeoutMs = 15000
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        ...JSON_HEADERS,
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });

    const rawText = await response.text();
    let data: any = null;

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    }

    if (!response.ok) {
      const message =
        (data && (data.error || data.message)) ||
        'Erreur de communication avec JARVIS';
      throw new Error(message);
    }

    return data as T;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Le serveur JARVIS ne répond pas assez vite.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function askJarvisChat(
  message: string,
  history: any[],
  currentModule: string,
  personality?: Partial<JarvisPersonalityProfile>
) {
  return requestJson('/api/jarvis/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history, currentModule, personality }),
  });
}

export async function generateEmailWithJarvis(params: {
  recipient: string;
  subject: string;
  purpose: string;
  tone: string;
  incomingContext?: string;
}) {
  return requestJson('/api/jarvis/email/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function generateCodeWithJarvis(params: {
  request: string;
  language?: string;
  target?: string;
}) {
  return requestJson('/api/jarvis/code/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function generatePublicationWithJarvis(params: {
  topic: string;
  platform: string;
  tone: string;
}) {
  return requestJson('/api/jarvis/publication/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function fetchServerStatus(): Promise<ServerTelemetry> {
  return requestJson<ServerTelemetry>('/api/server/status');
}

export async function fetchServerConfig() {
  return requestJson('/api/v1/server/config');
}

export async function updateServerConfig(config: any) {
  return requestJson('/api/v1/server/config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function analyzeEmailWithJarvis(email: any) {
  return requestJson('/api/jarvis/email/analyze', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function fetchEmailDigest(emails: any[]) {
  return requestJson('/api/jarvis/email/digest', {
    method: 'POST',
    body: JSON.stringify({ emails }),
  });
}

export async function triggerBatchEmailTriage(emails: any[]) {
  return requestJson('/api/jarvis/email/batch-triage', {
    method: 'POST',
    body: JSON.stringify({ emails }),
  });
}

export async function runCognitiveReasoning(goal: string, context?: any) {
  return requestJson('/api/jarvis/ai/reasoning', {
    method: 'POST',
    body: JSON.stringify({ goal, context }),
  });
}

export async function importPhotosFromDrive(source: 'google_drive' | 'google_photos', folder?: string) {
  return requestJson('/api/v1/photos/import-drive', {
    method: 'POST',
    body: JSON.stringify({ source, folder }),
  });
}

export async function syncPhotosFromXiaomi(phoneSourcePath?: string) {
  return requestJson('/api/v1/photos/sync-mobile', {
    method: 'POST',
    body: JSON.stringify({ phoneSourcePath }),
  });
}

export async function createServerPhotoAlbum(albumName: string) {
  return requestJson('/api/v1/photos/create-album', {
    method: 'POST',
    body: JSON.stringify({ albumName }),
  });
}

export async function savePhotoToServer(photo: any) {
  return requestJson('/api/v1/photos/save-file', {
    method: 'POST',
    body: JSON.stringify({ photo }),
  });
}

export async function compileCodeWithAiStudio(params: {
  code: string;
  filename: string;
  language?: string;
  target?: string;
}) {
  return requestJson('/api/v1/code/compile', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function syncCodeToGitHub(params: {
  commitMessage: string;
  files: Array<{ path: string; name: string }>;
  repo?: string;
  branch?: string;
  githubToken?: string;
}) {
  return requestJson('/api/v1/git/sync', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function saveCodeToHomeServer(params: {
  filePath: string;
  content: string;
}) {
  return requestJson('/api/v1/code/save-server', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function fetchGitStatus() {
  return requestJson('/api/v1/git/status');
}

export async function fetchJarvisPersonality(): Promise<{
  success: boolean;
  personality: JarvisPersonalityProfile;
  availableTones: Array<{ id: string; name: string; description: string }>;
  availableVoicePresets: Array<{ id: string; name: string }>;
}> {
  return requestJson('/api/v1/jarvis/personality');
}

export async function updateJarvisPersonality(config: Partial<JarvisPersonalityProfile>): Promise<{
  success: boolean;
  message: string;
  personality: JarvisPersonalityProfile;
  sampleReply: string;
}> {
  return requestJson('/api/v1/jarvis/personality', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}
