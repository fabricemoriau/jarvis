import { EmailItem, PhotoItem, AndroidFile, PublicationItem, AiModelNode, AutomationTask, EmailRule, CognitiveMemory } from '../types';

export const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'em-1',
    sender: 'Alexandre Laurent',
    senderEmail: 'a.laurent@technet-solutions.fr',
    recipient: 'fabrice.moriau@gmail.com',
    subject: 'Urgent : Validation architecture serveur domotique & API Mobile',
    snippet: 'Bonjour Fabrice, nous avons revu les spécifications du serveur dédié pour la passerelle Android...',
    body: `Bonjour Fabrice,

Nous avons revu en détail l'architecture du serveur dédié à domicile avec l'intégration de votre majordome JARVIS.
Les flux de données avec l'application mobile Android via WireGuard sont particulièrement optimisés.

Pouvez-vous nous confirmer d'ici demain si le port 51820 pour le tunnel VPN et les scripts de compilation distante sous Android Studio sont prêts pour les tests en conditions réelles ?

Bien cordialement,
Alexandre Laurent - Directeur Technique`,
    date: "Aujourd'hui à 11:42",
    category: 'urgent',
    unread: true,
    starred: true,
    suggestedAction: "Jarvis a préparé une confirmation technique et un récapitulatif des ports ouverts.",
    aiSummary: "Demande de confirmation urgente sur la configuration WireGuard (port 51820) et la compilation Android à distance d'ici demain.",
    urgencyScore: 92,
    deadline: "Demain à 18h00",
    sentiment: 'urgent',
    actionPoints: [
      "Vérifier l'ouverture du port 51820/udp sur le pare-feu UFW",
      "Confirmer la disponibilité du démon Gradle headless",
      "Envoyer le compte-rendu de connexion WireGuard à Alexandre",
    ],
  },
  {
    id: 'em-2',
    sender: 'Google Play Console',
    senderEmail: 'noreply-developer@google.com',
    recipient: 'fabrice.moriau@gmail.com',
    subject: 'Rapport d\'analyse : Jarvis Mobile Companion v2.4.0 (Zéro crash détecté)',
    snippet: 'Votre application Android Jarvis Mobile Companion enregistre un taux de stabilité de 99.98%...',
    body: `Cher développeur,

Votre application "Jarvis Mobile Companion" (com.jarvis.homeserver) a terminé son cycle de 7 jours sur le canal de test interne :
- Taux de plantage : 0.00%
- Utilisation de la batterie en tâche de fond : < 1.2% par 24h
- Réactivité du service d'arrière-plan : Optimale

L'APK debug est prêt pour la promotion en production ou pour vos installations directes via ADB.`,
    date: "Hier à 18:20",
    category: 'pro',
    unread: false,
    starred: true,
    suggestedAction: "Archiver et notifier le téléphone.",
    aiSummary: "Excellents résultats de stabilité pour l'APK Android (0% crash, batterie préservée).",
    urgencyScore: 35,
    deadline: "Semaine prochaine",
    sentiment: 'formal',
    actionPoints: [
      "Archiver le build de release v2.4.0 dans /nas/workspace/android/builds",
      "Notifier le smartphone Xiaomi de la disponibilité de la mise à jour",
    ],
  },
  {
    id: 'em-3',
    sender: 'Camille & Sophie',
    senderEmail: 'camille.famille@gmail.com',
    recipient: 'fabrice.moriau@gmail.com',
    subject: 'Photos du week-end en Bretagne & anniversaire',
    snippet: 'Coucou Fabrice ! On a enfin transféré les photos sur ton serveur dédié. Merci pour l\'accès partagé !',
    body: `Coucou Fabrice !

On a téléversé toutes les photos de notre séjour et du repas d'anniversaire dans le dossier partagé /nas/photos/incoming de ton serveur.
Dis à ton majordome Jarvis de faire le tri des yeux fermés et de nous faire un bel album !

Gros bisous,
Camille`,
    date: '25 Oct à 14:15',
    category: 'personnel',
    unread: true,
    starred: false,
    suggestedAction: "Lancer le scan de visages et l'album automatique.",
    aiSummary: "Photos de famille déposées sur le serveur NAS, demande de tri automatique et création d'album.",
    urgencyScore: 40,
    deadline: "Ce week-end",
    sentiment: 'friendly',
    actionPoints: [
      "Déclencher l'indexation neuronale du dossier /nas/photos/incoming",
      "Regrouper les visages (Fabrice, Sophie, Camille)",
      "Générer le lien sécurisé de partage familial",
    ],
  },
  {
    id: 'em-4',
    sender: 'Service Client Fibre Freebox',
    senderEmail: 'facture@freebox-telecom.fr',
    recipient: 'fabrice.moriau@gmail.com',
    subject: 'Votre facture Fibre 10G Ultra - Serveur Domotique Domicile',
    snippet: 'Votre facture mensuelle pour la connexion fibre dédiée de votre serveur est disponible (39,99 €)...',
    body: `Bonjour Monsieur Moriau,

Votre facture Freebox Ultra Fibre 10G pour le mois d'octobre s'élève à 39,99 €. Le prélèvement automatique sera effectué le 5 novembre.
Votre débit montant (upload) mesuré à votre domicile est de 7.8 Gbps, parfait pour l'hébergement de votre serveur dédié et les accès distants smartphone.`,
    date: '24 Oct à 09:00',
    category: 'factures',
    unread: false,
    starred: false,
    suggestedAction: "Classée automatiquement dans /nas/documents/factures/2026/.",
    aiSummary: "Facture fibre de 39,99 € payée, upload mesuré à 7.8 Gbps pour le serveur dédié.",
    urgencyScore: 20,
    deadline: "5 Novembre 2026",
    sentiment: 'formal',
    actionPoints: [
      "Archiver le justificatif PDF dans le coffre ZFS",
      "Valider la comptabilité domotique du mois",
    ],
  },
  {
    id: 'em-5',
    sender: 'Web Hosting Deals',
    senderEmail: 'newsletter@cheap-cloud-deals.xyz',
    recipient: 'fabrice.moriau@gmail.com',
    subject: 'Payez 500€/mois pour un serveur dans le cloud !',
    snippet: 'Découvrez nos offres cloud mutualisées alors que vous avez déjà un serveur dédié chez vous...',
    body: `Offre spéciale serveurs cloud lents et payants...`,
    date: '23 Oct à 04:12',
    category: 'spam',
    unread: false,
    starred: false,
    suggestedAction: "Filtré automatiquement par le module anti-spam IA de Jarvis.",
    aiSummary: "Spam publicitaire inutile bloqué par Jarvis.",
    urgencyScore: 5,
    sentiment: 'neutral',
    actionPoints: [
      "Quarantaine appliquée par Postfix SpamAssassin",
    ],
  },
];

export const INITIAL_EMAIL_RULES: EmailRule[] = [
  {
    id: 'rule-1',
    name: 'Alerte Pro Immédiate sur Xiaomi',
    condition: 'Expéditeur contient @technet-solutions.fr OU objet contient "Urgent"',
    action: 'Priorité Maximale + Notification Push Mobile instantanée',
    targetCategory: 'urgent',
    enabled: true,
    timesTriggered: 14,
  },
  {
    id: 'rule-2',
    name: 'Archivage Factures & Télécoms',
    condition: 'Expéditeur contient freebox OR edf OR impot.gouv',
    action: 'Classer dans Factures + Sauvegarde PDF dans /nas/documents/factures',
    targetCategory: 'factures',
    enabled: true,
    timesTriggered: 28,
  },
  {
    id: 'rule-3',
    name: 'Photos Familiales & Amis',
    condition: 'Objet contient "photos" OU expéditeur dans liste contacts famille',
    action: 'Classer dans Personnel + Notification de détection visages',
    targetCategory: 'personnel',
    enabled: true,
    timesTriggered: 9,
  },
  {
    id: 'rule-4',
    name: 'Bouclier Anti-Spam & Marketing Agressif',
    condition: 'Mots-clés promotionnels, newsletter non sollicitée, score Bayes > 0.85',
    action: 'Mise en quarantaine discrète sans notification sonore',
    targetCategory: 'spam',
    enabled: true,
    timesTriggered: 182,
  },
];

export const INITIAL_COGNITIVE_MEMORIES: CognitiveMemory[] = [
  {
    id: 'mem-1',
    category: 'preference',
    title: 'Ton & Style de Communication',
    detail: 'Monsieur Fabrice apprécie des réponses courtoises, concises, techniques et sans fioritures superflues.',
    confidence: 99,
    lastUpdated: "Aujourd'hui à 09:12",
  },
  {
    id: 'mem-2',
    category: 'contact',
    title: 'Interlocuteur Clé : Alexandre Laurent',
    detail: 'Directeur Technique chez Technet Solutions. Priorité absolue sur les emails concernant l\'architecture et WireGuard.',
    confidence: 98,
    lastUpdated: 'Hier à 18:30',
  },
  {
    id: 'mem-3',
    category: 'server',
    title: 'Topologie Domotique Debian 192.168.1.98',
    detail: 'Nœud serveur principal Debian Bookworm, ZFS raidz 8TB (/nas), port 51820 pour tunnel WireGuard, port 3000 API REST.',
    confidence: 100,
    lastUpdated: 'Il y a 3 jours',
  },
  {
    id: 'mem-4',
    category: 'habit',
    title: 'Smartphone Mobile Privilégié',
    detail: 'Xiaomi HyperOS (Android 14) connecté en permanence par WireGuard (IP VPN 100.84.12.9). Reçoit les pushs prioritaires.',
    confidence: 97,
    lastUpdated: 'Il y a 10 minutes',
  },
  {
    id: 'mem-5',
    category: 'project',
    title: 'Application Android "Jarvis Mobile Companion"',
    detail: 'Package com.jarvis.homeserver, minSdk 26, Jetpack Compose, build automatisé via démon Gradle sans GUI.',
    confidence: 96,
    lastUpdated: 'Hier à 14:00',
  },
];


export const INITIAL_PHOTOS: PhotoItem[] = [
  {
    id: 'ph-1',
    title: 'Sejour_Bretagne_Cote_Sauvage_01.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    date: '26 Octobre 2026',
    album: 'Voyages',
    size: '8.4 MB',
    resolution: '48MP (Sony A7 IV)',
    tags: ['Plage', 'Océan', 'Nature', 'Coucher de soleil', 'Côte'],
    isSyncedFromMobile: true,
    facesDetected: ['Fabrice', 'Sophie'],
    isDuplicateCandidate: false,
  },
  {
    id: 'ph-2',
    title: 'Sejour_Bretagne_Cote_Sauvage_02_Rafale.jpg',
    url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    date: '26 Octobre 2026',
    album: 'Voyages',
    size: '8.2 MB',
    resolution: '48MP (Sony A7 IV)',
    tags: ['Plage', 'Océan', 'Rafale', 'Doublon potentiel'],
    isSyncedFromMobile: true,
    facesDetected: ['Fabrice'],
    isDuplicateCandidate: true,
  },
  {
    id: 'ph-3',
    title: 'Anniversaire_Famille_Maison.jpg',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    date: '25 Octobre 2026',
    album: 'Famille',
    size: '5.1 MB',
    resolution: '50MP Leica (Xiaomi)',
    tags: ['Famille', 'Fête', 'Repas', 'Sourires', 'Intérieur'],
    isSyncedFromMobile: true,
    facesDetected: ['Camille', 'Sophie', 'Fabrice'],
    isDuplicateCandidate: false,
  },
  {
    id: 'ph-4',
    title: 'Serveur_Dedie_Domicile_Baie_Rack.jpg',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    date: '22 Octobre 2026',
    album: 'Projets Android',
    size: '6.7 MB',
    resolution: '50MP (Pixel Pro)',
    tags: ['Serveur', 'Tech', 'Hardware', 'Ryzen', 'Rack 19 pouces'],
    isSyncedFromMobile: true,
    facesDetected: [],
    isDuplicateCandidate: false,
  },
  {
    id: 'ph-5',
    title: 'Android_Studio_Jarvis_UI_Mockup.jpg',
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80',
    date: '20 Octobre 2026',
    album: 'Captures',
    size: '1.8 MB',
    resolution: '1440x3120',
    tags: ['Android Studio', 'Jetpack Compose', 'UI', 'Dark Mode'],
    isSyncedFromMobile: true,
    facesDetected: [],
    isDuplicateCandidate: false,
  },
  {
    id: 'ph-6',
    title: 'Document_Scanne_Attestation_Fibre.jpg',
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    date: '18 Octobre 2026',
    album: 'Documents',
    size: '3.2 MB',
    resolution: '300 DPI OCR',
    tags: ['Contrat', 'Document officiel', 'Fibre', 'OCR indexé'],
    isSyncedFromMobile: false,
    facesDetected: [],
    isDuplicateCandidate: false,
  },
];

export const INITIAL_ANDROID_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/java/com/jarvis/homeserver/MainActivity.kt',
    name: 'MainActivity.kt',
    type: 'file',
    language: 'kotlin',
    content: `package com.jarvis.homeserver

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            JarvisMobileTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF040711)
                ) {
                    JarvisDashboardScreen()
                }
            }
        }
    }
}

@Composable
fun JarvisDashboardScreen() {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("J.A.R.V.I.S. Mobile", style = MaterialTheme.typography.headlineMedium, color = Color(0xFF00F2FE))
        Spacer(modifier = Modifier.height(8.dp))
        Text("Connecté au serveur dédié (192.168.1.98)", color = Color.White)
        // Passerelle vers les commandes vocales, emails et caméra
    }
}`,
  },
  {
    path: 'app/src/main/java/com/jarvis/homeserver/service/JarvisSyncWorker.kt',
    name: 'JarvisSyncWorker.kt',
    type: 'file',
    language: 'kotlin',
    content: `package com.jarvis.homeserver.service

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Worker en arrière-plan assurant la synchronisation permanente
 * entre le smartphone et le serveur dédié à domicile.
 */
class JarvisSyncWorker(
    appContext: Context, 
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // 1. Synchronisation des nouvelles photos prises avec le téléphone
            syncCameraRollToHomeNas()
            
            // 2. Récupération des notifications prioritaires de Jarvis (emails urgents, builds terminés)
            pollJarvisAlerts()
            
            // 3. Battement de cœur vers le serveur dédié via VPN WireGuard
            sendHeartbeat(battery = getBatteryPercentage())

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private suspend fun syncCameraRollToHomeNas() {
        // Envoi sécurisé des flux médias vers le serveur local
    }

    private suspend fun pollJarvisAlerts() {
        // Réception des push de notifications
    }

    private fun sendHeartbeat(battery: Int) {
        // Télémétrie vers Jarvis Server
    }

    private fun getBatteryPercentage(): Int = 88
}`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts',
    type: 'file',
    language: 'groovy',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.jarvis.homeserver"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.jarvis.homeserver"
        minSdk = 26
        targetSdk = 35
        versionCode = 241
        versionName = "2.4.1"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
}`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    type: 'file',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="JARVIS Companion"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.JarvisMobile">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.JarvisMobile">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.JarvisForegroundService"
            android:foregroundServiceType="dataSync"
            android:exported="false" />
    </application>
</manifest>`,
  },
];

export const INITIAL_PUBLICATIONS: PublicationItem[] = [
  {
    id: 'pub-1',
    platform: 'linkedin',
    topic: 'Serveur dédié à domicile & Majordome IA autonome',
    content: `🚀 Pourquoi j'ai installé mon propre majordome IA (JARVIS) sur un serveur dédié à domicile :

1️⃣ 100% Souveraineté des données : Mes photos de famille, mes courriels et mes projets Android ne quittent jamais mon réseau local privé.
2️⃣ Aucune dépendance aux abonnements cloud hors de prix : J'orchestre des IA gratuites et open-source locales (Mistral, Llama-3) complétées par Gemini Flash.
3️⃣ Accès mobile permanent : Depuis mon smartphone, j'ordonne des compilations Android Studio, je dicte des emails et je reçois des résumés automatisés.

L'auto-hébergement moderne avec l'IA devient une arme absolue de productivité personnelle. 💡`,
    hashtags: ['#HomeServer', '#SelfHosted', '#AndroidDev', '#ArtificialIntelligence', '#TechPrivacy'],
    status: 'published',
    scheduledDate: '26 Oct 2026 à 09:30',
    likes: 142,
    comments: 29,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pub-2',
    platform: 'twitter',
    topic: 'Compilation Android Studio à distance via commande vocale Jarvis',
    content: `« Jarvis, compile l'APK et envoie-le sur mon smartphone. » 📱⚡

Mon serveur dédié AMD Ryzen + RTX 4090 exécute Gradle en tâche de fond et me livre l'APK debug signé en 8 secondes chrono via Wi-Fi 6E.

Finies les surchauffes sur PC portable ! 🔥`,
    hashtags: ['#AndroidStudio', '#Kotlin', '#JetpackCompose', '#DevProductivity'],
    status: 'scheduled',
    scheduledDate: 'Demain à 10:15',
    likes: 0,
    comments: 0,
  },
  {
    id: 'pub-3',
    platform: 'instagram',
    topic: 'Le setup de mon serveur dédié silencieux au domicile',
    content: `Un aperçu du cœur névralgique de la maison : le serveur dédié où tourne Jarvis 24h/24 ! Silencieux, ventilé, économe et toujours à l'écoute. ✨🤖`,
    hashtags: ['#TechSetup', '#HomeLab', '#CyberpunkVibe', '#SmartHome'],
    status: 'draft',
    likes: 0,
    comments: 0,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
  },
];

export const AI_MODELS_MATRIX: AiModelNode[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Google Gemini 3.8 Flash',
    type: 'cloud_free',
    status: 'active',
    description: 'Modèle multimodal ultra-rapide utilisé pour le raisonnement général, la synthèse des emails et la vision.',
    cost: 'Gratuit (Free Tier Cloud API)',
    latency: '340ms',
    specialty: 'Emails, Vision photos, Raisonnement complexe & Voix',
  },
  {
    id: 'ollama-llama3',
    name: 'Ollama Llama-3 8B (Serveur Domicile)',
    type: 'local',
    status: 'active',
    description: 'Tourne 100% en local sur le GPU RTX 4090 du serveur dédié. Confidentialité absolue sans aucun coût.',
    cost: '0,00 € (Local GPU)',
    vramUsage: '5.8 GB / 24 GB VRAM',
    latency: '85ms (Local Token Streaming)',
    specialty: 'Tri confidentiel, logs système, offline fallback',
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B Instruct v0.3 (Serveur Domicile)',
    type: 'local',
    status: 'active',
    description: 'Modèle européen open-source optimisé pour la langue française et les instructions concises.',
    cost: '0,00 € (Local GPU)',
    vramUsage: '4.6 GB / 24 GB VRAM',
    latency: '78ms',
    specialty: 'Rédaction en français, ton de majordome, synthèse',
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder 6.7B (Android Studio Engine)',
    type: 'local',
    status: 'active',
    description: 'Spécialisé dans le code Android Kotlin, Jetpack Compose, XML layouts et résolution de bugs Gradle.',
    cost: '0,00 € (Local GPU)',
    vramUsage: '5.1 GB / 24 GB VRAM',
    latency: '92ms',
    specialty: 'Programmation Android Studio, Kotlin, Gradle',
  },
  {
    id: 'whisper-large-v3',
    name: 'Whisper v3 Speech-to-Text (Local)',
    type: 'local',
    status: 'active',
    description: 'Transcription vocale locale instantanée des mémos audio envoyés depuis le smartphone.',
    cost: '0,00 € (Local GPU)',
    vramUsage: '3.1 GB / 24 GB VRAM',
    latency: '110ms',
    specialty: 'Reconnaissance vocale microphone & dictée',
  },
];

export const AUTOMATION_TASKS: AutomationTask[] = [
  {
    id: 'cron-1',
    title: 'Synchronisation et tri automatique des photos du smartphone',
    schedule: 'Toutes les 30 minutes',
    category: 'photo',
    enabled: true,
    lastRun: 'Il y a 12 min',
    status: 'success',
  },
  {
    id: 'cron-2',
    title: 'Relevé IMAP & filtrage intelligent des emails par Jarvis',
    schedule: 'Toutes les 5 minutes',
    category: 'email',
    enabled: true,
    lastRun: 'Il y a 2 min',
    status: 'success',
  },
  {
    id: 'cron-3',
    title: 'Vérification des mises à jour Gradle & dépendances Android Studio',
    schedule: 'Tous les jours à 06h00',
    category: 'android',
    enabled: true,
    lastRun: 'Aujourd\'hui 06:00',
    status: 'success',
  },
  {
    id: 'cron-4',
    title: 'Publication programmée des posts réseaux sociaux',
    schedule: 'Créneaux optimaux (Mardi & Jeudi)',
    category: 'publication',
    enabled: true,
    lastRun: 'Hier à 09:30',
    status: 'pending',
  },
  {
    id: 'cron-5',
    title: 'Sauvegarde miroir RAID NVMe & vérification intégrité NAS',
    schedule: 'Chaque nuit à 03h00',
    category: 'backup',
    enabled: true,
    lastRun: 'Cette nuit 03:00',
    status: 'success',
  },
];
