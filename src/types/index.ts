export type NavigationTab = 
  | 'overview' 
  | 'hologram'
  | 'emails' 
  | 'photos' 
  | 'android' 
  | 'publications' 
  | 'multi_ai' 
  | 'server' 
  | 'api_docs'
  | 'mobile';

export type JarvisTone = 'classic' | 'sarcastic' | 'humorous' | 'tactical' | 'philosophical';

export interface JarvisPersonalityProfile {
  tone: JarvisTone;
  voicePreset: 'jarvis_classic' | 'jarvis_cyber' | 'friday' | 'karen';
  pitch: number;
  rate: number;
  volume: number;
  userSalutation: string;
  sarcasmLevel: number; // 0 to 100
  selectedVoiceURI?: string;
}


export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'system';
  text: string;
  timestamp: string;
  actionTaken?: string;
  moduleTarget?: NavigationTab;
  codeSnippet?: {
    filename: string;
    code: string;
    language: string;
  };
}

export interface EmailItem {
  id: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  category: 'urgent' | 'pro' | 'personnel' | 'factures' | 'spam';
  unread: boolean;
  starred: boolean;
  suggestedAction?: string;
  aiSummary?: string;
  urgencyScore?: number; // 0 to 100%
  actionPoints?: string[];
  deadline?: string;
  sentiment?: 'urgent' | 'neutral' | 'friendly' | 'formal';
}

export interface EmailRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  targetCategory: string;
  enabled: boolean;
  timesTriggered: number;
}

export interface CognitiveMemory {
  id: string;
  category: 'preference' | 'contact' | 'server' | 'habit' | 'project';
  title: string;
  detail: string;
  confidence: number;
  lastUpdated: string;
}

export interface CognitivePlanStep {
  stepNumber: number;
  subAgent: string;
  action: string;
  toolUsed: string;
  status: 'pending' | 'executing' | 'completed';
  outputSnippet?: string;
}


export interface PhotoItem {
  id: string;
  title: string;
  url: string;
  date: string;
  album: string;
  size: string;
  resolution: string;
  tags: string[];
  isSyncedFromMobile: boolean;
  facesDetected?: string[];
  isDuplicateCandidate?: boolean;
  source?: 'xiaomi_mobile' | 'google_drive' | 'google_photos' | 'local_upload' | 'nas_vault';
  serverPath?: string;
  exifData?: {
    camera?: string;
    focalLength?: string;
    iso?: number;
    gps?: string;
  };
}


export interface AndroidFile {
  path: string;
  name: string;
  type: 'file' | 'folder';
  language: 'kotlin' | 'xml' | 'groovy' | 'json';
  content: string;
}

export interface PublicationItem {
  id: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'blog';
  topic: string;
  content: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledDate?: string;
  likes?: number;
  comments?: number;
  imageUrl?: string;
}

export interface AiModelNode {
  id: string;
  name: string;
  type: 'local' | 'cloud_free';
  status: 'active' | 'standby';
  description: string;
  cost: string;
  vramUsage?: string;
  latency: string;
  specialty: string;
}

export interface ServerService {
  id: string;
  name: string;
  status: 'online' | 'syncing' | 'ready' | 'idle';
  port: number;
  latency: string;
}

export interface ServerTelemetry {
  hostname: string;
  ip: string;
  vpnTunnel: string;
  os: string;
  uptime: string;
  hardware: {
    cpu: string;
    ram: string;
    gpu: string;
    storage: {
      totalGb: number;
      usedGb: number;
      freeGb: number;
      breakdown: {
        photosVault: string;
        aiModelsWeights: string;
        androidWorkspace: string;
        systemAndDocker: string;
      };
    };
  };
  liveMetrics: {
    cpuPercent: number;
    ramPercent: number;
    gpuPercent: number;
    tempCelsius: number;
    networkUploadMbps: string;
    networkDownloadMbps: string;
  };
  services: ServerService[];
  mobileClient: {
    connected: boolean;
    deviceName: string;
    lastPing: string;
    batteryLevel: string;
    location: string;
    pendingUploads: number;
  };
}

export interface HomeServerConfig {
  serverName: string;
  localIp: string;
  subnetMask: string;
  gateway: string;
  domainName: string;
  httpPort: number;
  sshPort: number;
  wireguardPort: number;
  wireguardIp: string;
  ddnsDomain: string;
  storagePathNas: string;
  storagePathPhotos: string;
  storagePathAndroid: string;
  backupSchedule: string;
  ollamaPort: number;
  allowExternalMobileAccess: boolean;
  enableTlsSsl: boolean;
  adminEmail: string;
  hardwareCpu: string;
  hardwareRam: string;
  hardwareGpu: string;
}

export interface AutomationTask {
  id: string;
  title: string;
  schedule: string;
  category: 'email' | 'photo' | 'android' | 'backup' | 'publication';
  enabled: boolean;
  lastRun: string;
  status: 'success' | 'running' | 'pending';
}

