import React, { useState } from 'react';
import {
  Webhook,
  Code2,
  Play,
  Copy,
  CheckCircle2,
  Send,
  Terminal,
  ShieldCheck,
  FileJson,
  Download,
  Key,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface ApiDocsModuleProps {
  onNotify: (msg: string) => void;
}

interface EndpointDef {
  method: 'GET' | 'POST';
  path: string;
  name: string;
  description: string;
  defaultBody?: any;
}

export const ApiDocsModule: React.FC<ApiDocsModuleProps> = ({ onNotify }) => {
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [requestBodyText, setRequestBodyText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseResult, setResponseResult] = useState<any | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'kotlin' | 'curl' | 'python' | 'ts'>('kotlin');

  const apiKeyToken = 'jarvis_sec_8f92a10e47b9c31d';

  const endpoints: EndpointDef[] = [
    {
      method: 'POST',
      path: '/api/v1/command',
      name: 'Ordre Universel en Langage Naturel',
      description: 'Permet de donner n’importe quelle instruction à JARVIS qui analyse l’intention et exécute la tâche.',
      defaultBody: {
        command: "Jarvis, compile le projet Android Studio et prépare l'APK",
        client: "xiaomi-hyperos-fabrice",
      },
    },
    {
      method: 'POST',
      path: '/api/v1/emails/generate',
      name: 'Génération & Rédaction de Courriel IA',
      description: 'Rédige un email professionnel structuré et prêt à l’envoi.',
      defaultBody: {
        recipient: "alexandre.laurent@technet-solutions.fr",
        subject: "Confirmation architecture serveur dédié & WireGuard",
        purpose: "Confirmer que le port 51820 est ouvert et que le serveur compile sans erreur",
        tone: "professionnel",
      },
    },
    {
      method: 'POST',
      path: '/api/v1/android/generate',
      name: 'Programmation Android Studio (Kotlin)',
      description: 'Génère des composants Jetpack Compose, Coroutines ou configurations Gradle.',
      defaultBody: {
        request: "Créer un composant Jetpack Compose affichant la jauge de température du serveur",
        language: "kotlin",
        target: "android_studio",
      },
    },
    {
      method: 'POST',
      path: '/api/v1/android/build',
      name: 'Déclencher la Compilation Gradle (assembleDebug)',
      description: 'Lance la compilation de l’application Android sur le serveur dédié et génère l’APK.',
      defaultBody: {},
    },
    {
      method: 'POST',
      path: '/api/v1/publications/generate',
      name: 'Génération de Publication Réseaux Sociaux',
      description: 'Crée un post complet avec accroche, texte et hashtags ciblés.',
      defaultBody: {
        topic: "Pourquoi héberger son propre majordome IA sur un serveur dédié à la maison",
        platform: "linkedin",
        tone: "inspirant",
      },
    },
    {
      method: 'GET',
      path: '/api/v1/server/telemetry',
      name: 'Télémétrie Serveur & Vitals Matériel',
      description: 'Retourne la charge CPU, RAM, GPU RTX 4090, stockage NVMe et statut des conteneurs Docker.',
    },
    {
      method: 'POST',
      path: '/api/v1/mobile/push',
      name: 'Envoyer une Notification Push Smartphone',
      description: 'Envoie une alerte prioritaire vers l’application mobile reliée au serveur.',
      defaultBody: {
        title: "Alerte Serveur JARVIS",
        message: "Compilation de l'APK v2.4.1 terminée avec succès !",
        priority: "high",
      },
    },
    {
      method: 'GET',
      path: '/api/v1/health',
      name: 'Healthcheck & État du Nœud',
      description: 'Vérifie la disponibilité du serveur et des démons d’arrière-plan.',
    },
    {
      method: 'GET',
      path: '/api/v1/openapi.json',
      name: 'Spécification OpenAPI 3.0 (JSON)',
      description: 'Export du schéma complet de l’API pour Postman, Swagger ou génération de clients.',
    },
  ];

  const currentEndpoint = endpoints[selectedEndpointIndex];

  // Set default body on select
  React.useEffect(() => {
    if (currentEndpoint.defaultBody) {
      setRequestBodyText(JSON.stringify(currentEndpoint.defaultBody, null, 2));
    } else {
      setRequestBodyText('');
    }
    setResponseResult(null);
  }, [selectedEndpointIndex]);

  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    const startTime = performance.now();

    try {
      let bodyData = undefined;
      if (currentEndpoint.method === 'POST' && requestBodyText.trim()) {
        bodyData = JSON.parse(requestBodyText);
      }

      const res = await fetch(currentEndpoint.path, {
        method: currentEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyToken}`,
          'X-Jarvis-Key': apiKeyToken,
        },
        body: bodyData ? JSON.stringify(bodyData) : undefined,
      });

      const data = await res.json();
      const endTime = performance.now();

      setResponseResult({
        status: res.status,
        statusText: res.statusText,
        latencyMs: Math.round(endTime - startTime),
        data,
      });

      onNotify(`Requête ${currentEndpoint.method} ${currentEndpoint.path} exécutée avec succès (Status ${res.status}).`);
    } catch (err: any) {
      const endTime = performance.now();
      setResponseResult({
        status: 500,
        statusText: 'Error',
        latencyMs: Math.round(endTime - startTime),
        error: err.message,
      });
      onNotify(`Erreur d'appel API : ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const getCodeSnippet = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.1.98:3000';
    const url = `${origin}${currentEndpoint.path}`;

    if (activeCodeTab === 'kotlin') {
      return `// Android Studio - Kotlin (Retrofit / OkHttp)
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()
val mediaType = "application/json; charset=utf-8".toMediaType()
val jsonBody = """
${requestBodyText || '{}'}
""".trimIndent()

val request = Request.Builder()
    .url("${url}")
    .addHeader("Authorization", "Bearer ${apiKeyToken}")
    .addHeader("X-Jarvis-Key", "${apiKeyToken}")
    ${currentEndpoint.method === 'POST' ? `.post(jsonBody.toRequestBody(mediaType))` : '.get()'}
    .build()

val response = client.newCall(request).execute()
val resultJson = response.body?.string()
println("Réponse JARVIS : $resultJson")`;
    }

    if (activeCodeTab === 'curl') {
      return `# cURL Terminal / Bash
curl -X ${currentEndpoint.method} "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKeyToken}" \\
  -H "X-Jarvis-Key: ${apiKeyToken}" \\
  ${currentEndpoint.method === 'POST' ? `-d '${requestBodyText.replace(/\n/g, '')}'` : ''}`;
    }

    if (activeCodeTab === 'python') {
      return `# Python 3 (Requests)
import requests

url = "${url}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKeyToken}",
    "X-Jarvis-Key": "${apiKeyToken}"
}
${currentEndpoint.method === 'POST' ? `payload = ${requestBodyText || '{}'}\nresponse = requests.post(url, json=payload, headers=headers)` : `response = requests.get(url, headers=headers)`}

print(response.status_code)
print(response.json())`;
    }

    return `// TypeScript / Node.js
const response = await fetch("${url}", {
  method: "${currentEndpoint.method}",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKeyToken}",
    "X-Jarvis-Key": "${apiKeyToken}"
  },
  ${currentEndpoint.method === 'POST' ? `body: JSON.stringify(${requestBodyText || '{}'})` : ''}
});
const data = await response.json();
console.log(data);`;
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl hud-glass border border-cyan-500/20">
        <div>
          <h2 className="text-lg font-hud font-bold text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-cyan-400" />
            <span>API REST JARVIS & Console Développeur</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Pilotez votre majordome depuis votre smartphone, Android Studio, Python ou n’importe quel script distant.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/v1/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-hud text-cyan-300 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Spécification OpenAPI 3.0</span>
          </a>
        </div>
      </div>

      {/* API Key & Authentication Banner */}
      <div className="p-4 rounded-2xl hud-glass-card border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
            <Key className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-hud font-bold text-white uppercase tracking-wider">
              Jeton d'Authentification API Local (JARVIS Token)
            </h4>
            <p className="text-xs text-slate-300 font-mono">
              À inclure dans vos requêtes via l'en-tête <code className="text-cyan-400">Authorization: Bearer &lt;TOKEN&gt;</code> ou <code className="text-cyan-400">X-Jarvis-Key</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <code className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 select-all">
            {apiKeyToken}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(apiKeyToken);
              onNotify("Jeton API copié dans le presse-papier !");
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Copier le jeton"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Endpoints list + Interactive Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Sidebar */}
        <div className="lg:col-span-4 hud-glass p-3 rounded-2xl border border-cyan-500/20 space-y-2">
          <div className="text-xs font-hud font-bold text-cyan-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800 flex items-center justify-between">
            <span>Points de Terminaison (Routes)</span>
            <span className="text-[10px] text-slate-500 font-mono">{endpoints.length} routes v1</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[620px] pr-1">
            {endpoints.map((ep, idx) => {
              const isSelected = selectedEndpointIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedEndpointIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500/60 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-hud font-bold ${
                        ep.method === 'POST'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-200 truncate">
                      {ep.path}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans truncate">
                    {ep.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Playground & Code Generator */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Endpoint Header */}
          <div className="hud-glass-card p-5 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-hud font-bold ${
                    currentEndpoint.method === 'POST'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {currentEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {currentEndpoint.path}
                </span>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={isExecuting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
              >
                {isExecuting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{isExecuting ? 'Exécution...' : 'Tester cette requête'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {currentEndpoint.description}
            </p>

            {/* Request Body (if POST) */}
            {currentEndpoint.method === 'POST' && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-hud text-slate-400 uppercase">
                  <span>Corps de la requête (JSON Body) :</span>
                  <button
                    onClick={() => {
                      if (currentEndpoint.defaultBody) {
                        setRequestBodyText(JSON.stringify(currentEndpoint.defaultBody, null, 2));
                      }
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    Réinitialiser
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          {responseResult && (
            <div className="hud-glass p-5 rounded-2xl border border-cyan-500/30 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-hud font-bold text-white uppercase tracking-wider">
                    Réponse du Serveur Dédié :
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      responseResult.status < 300
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    HTTP {responseResult.status} {responseResult.statusText}
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400">
                  {responseResult.latencyMs} ms
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto max-h-60">
                <pre>{JSON.stringify(responseResult.data || responseResult.error, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Code Integration Snippets */}
          <div className="hud-glass rounded-2xl border border-cyan-500/20 overflow-hidden space-y-0">
            <div className="flex flex-wrap items-center justify-between p-3 bg-slate-950 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-1.5 text-xs font-hud font-bold text-white">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Intégration Directe dans votre Projet :</span>
              </div>

              {/* Code Tab Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {[
                  { id: 'kotlin', label: 'Android Studio (Kotlin)' },
                  { id: 'curl', label: 'cURL / Bash' },
                  { id: 'python', label: 'Python 3' },
                  { id: 'ts', label: 'TypeScript' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveCodeTab(t.id as any)}
                    className={`px-2.5 py-1 rounded text-[11px] font-hud transition-colors ${
                      activeCodeTab === t.id
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950 font-mono-code text-xs text-slate-300 overflow-x-auto max-h-64 leading-relaxed relative">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getCodeSnippet());
                  onNotify("Code d'intégration copié dans le presse-papier !");
                }}
                className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-hud"
              >
                <Copy className="w-3 h-3" />
                <span>Copier</span>
              </button>
              <pre>{getCodeSnippet()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
