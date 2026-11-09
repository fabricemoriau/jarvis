package com.jarvis.homeserver

import android.os.Bundle
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jarvis.homeserver.network.JarvisApiManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this, this)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF030712)
                ) {
                    JarvisHudDashboard(onSpeak = { speakOut(it) })
                }
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.FRENCH
            tts?.setPitch(0.95f)
            tts?.setSpeechRate(1.05f)
        }
    }

    private fun speakOut(text: String) {
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "JARVIS_TTS")
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}

@Composable
fun JarvisHudDashboard(onSpeak: (String) -> Unit) {
    val coroutineScope = rememberCoroutineScope()
    var selectedTab by remember { mutableStateOf(0) }
    val tabTitles = listOf("COCKPIT", "MAILS", "PHOTOS", "SERVEUR")

    var connectionStatus by remember { mutableStateOf("Initialisation de la liaison...") }
    var activeEndpoint by remember { mutableStateOf("Analyse des nœuds...") }
    var isConnected by remember { mutableStateOf(false) }
    var isThinking by remember { mutableStateOf(false) }
    var inputText by remember { mutableStateOf("") }

    val pendingOrders = remember { mutableStateListOf<String>() }

    val logs = remember { mutableStateListOf(
        "[SYSTEME] Boot JARVIS Mobile Companion v3.2",
        "[RESILIENCE] File d'attente hors-ligne & auto-retry activés.",
        "[SYNTHÈSE VOCALE] Moteur de voix majordome prêt.",
        "[SERVEUR] Démon Python 100.67.0.126 & 192.168.1.98 ouverts."
    ) }

    fun executeOrder(cmd: String) {
        if (cmd.isNotBlank()) {
            coroutineScope.launch {
                logs.add(0, "[FABRICE] $cmd")
                if (!isConnected) {
                    pendingOrders.add(cmd)
                    logs.add(0, "[ATTENTE ⌛] Hors-ligne. Ordre gardé en mémoire, exécution automatique dès reconnexion.")
                    onSpeak("Liaison interrompue. Ordre placé en file d'attente.")
                } else {
                    isThinking = true
                    val reply = JarvisApiManager.sendCommand(cmd)
                    isThinking = false
                    logs.add(0, "[JARVIS] $reply")
                    onSpeak(reply)
                }
            }
        }
    }

    // Auto-retry connectivity ticker loop
    LaunchedEffect(Unit) {
        while (true) {
            val activeUrl = JarvisApiManager.resolveActiveServerUrl()
            activeEndpoint = activeUrl
            val pingSuccess = JarvisApiManager.pingServer(activeUrl)
            
            if (pingSuccess) {
                if (!isConnected) {
                    logs.add(0, "[OK] Liaison rétablie sur : $activeUrl")
                }
                isConnected = true
                connectionStatus = "Connecté & Synchronisé 24/7"

                if (pendingOrders.isNotEmpty()) {
                    val listToExecute = pendingOrders.toList()
                    pendingOrders.clear()
                    for (queuedCmd in listToExecute) {
                        logs.add(0, "[REPRISE ⚡] Connexion retrouvée ! Exécution de l'ordre en attente : $queuedCmd")
                        onSpeak("Liaison rétablie. Exécution de votre ordre.")
                        isThinking = true
                        val reply = JarvisApiManager.sendCommand(queuedCmd)
                        isThinking = false
                        logs.add(0, "[JARVIS] $reply")
                        onSpeak(reply)
                    }
                }
            } else {
                isConnected = false
                connectionStatus = "Recherche de liaison (Filtre auto-retry...)"
            }
            delay(5000)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF030712), Color(0xFF0B132B), Color(0xFF030712))
                )
            )
            .padding(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // --- 1. HEADER HUD & APPAREIL ---
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "J.A.R.V.I.S. HUD v3.2",
                    color = Color(0xFF00F2FE),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "MAJORDOME SOUVERAIN • RÉSILIENCE HORS-LIGNE • XIAOMI 14T PRO",
                    color = Color(0xFF64748B),
                    fontSize = 8.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (isConnected) Color(0xFF052E16) else Color(0xFF450A0A))
                    .border(1.dp, if (isConnected) Color(0xFF22C55E) else Color(0xFFEF4444), RoundedCornerShape(10.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = if (isConnected) "EN LIGNE" else "HORS LIGNE",
                    color = if (isConnected) Color(0xFF4ADE80) else Color(0xFFFCA5A5),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // --- 2. BARRE DE NAVIGATION ERGONOMIQUE PAR ONGLETS ---
        ScrollableTabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color(0xFF0F172A),
            contentColor = Color(0xFF00F2FE),
            edgePadding = 4.dp,
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
        ) {
            tabTitles.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = title,
                            fontSize = 11.sp,
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                            color = if (selectedTab == index) Color(0xFF00F2FE) else Color(0xFF64748B),
                            fontFamily = FontFamily.Monospace
                        )
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // --- 3. CONTENU PAR ONGLET ---
        when (selectedTab) {
            0 -> CockpitTabContent(
                isThinking = isThinking,
                connectionStatus = connectionStatus,
                activeEndpoint = activeEndpoint,
                pendingCount = pendingOrders.size,
                inputText = inputText,
                onInputTextChange = { inputText = it },
                onExecute = { executeOrder(it) },
                onRefresh = {
                    coroutineScope.launch {
                        val activeUrl = JarvisApiManager.resolveActiveServerUrl()
                        activeEndpoint = activeUrl
                        isConnected = JarvisApiManager.pingServer(activeUrl)
                    }
                },
                logs = logs
            )
            1 -> EmailsTabContent(onExecute = { executeOrder(it) })
            2 -> PhotosTabContent(onExecute = { executeOrder(it) })
            3 -> ServerTabContent(onExecute = { executeOrder(it) })
        }
    }
}

@Composable
fun CockpitTabContent(
    isThinking: Boolean,
    connectionStatus: String,
    activeEndpoint: String,
    pendingCount: Int,
    inputText: String,
    onInputTextChange: (String) -> Unit,
    onExecute: (String) -> Unit,
    onRefresh: () -> Unit,
    logs: List<String>
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        // Arc Reactor Widget
        ArcReactorWidget(isThinking = isThinking, onClick = onRefresh)

        Spacer(modifier = Modifier.height(10.dp))

        // Telemetry Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF00F2FE).copy(alpha = 0.3f), RoundedCornerShape(14.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A).copy(alpha = 0.8f)),
            shape = RoundedCornerShape(14.dp)
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "LIAISON SERVEUR DOMESTIQUE",
                        color = Color(0xFF00F2FE),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                    if (pendingCount > 0) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF78350F))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "⌛ $pendingCount EN ATTENTE",
                                color = Color(0xFFFACC15),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(2.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "Statut : ", color = Color(0xFF94A3B8), fontSize = 10.sp)
                    Text(text = connectionStatus, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "Point d'accès : ", color = Color(0xFF94A3B8), fontSize = 10.sp)
                    Text(text = activeEndpoint, color = Color(0xFF38BDF8), fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Omnibar Input
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = onInputTextChange,
                placeholder = { Text("Tapez un ordre pour JARVIS...", color = Color(0xFF64748B), fontSize = 10.sp) },
                modifier = Modifier.weight(1f),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF00F2FE),
                    unfocusedBorderColor = Color(0xFF1E293B),
                    focusedContainerColor = Color(0xFF0F172A),
                    unfocusedContainerColor = Color(0xFF0B132B),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(10.dp),
                singleLine = true
            )

            Button(
                onClick = { onExecute(inputText.trim()) },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F2FE)),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("EXÉCUTER", color = Color(0xFF030712), fontWeight = FontWeight.Bold, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Terminal Console
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF020617)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(8.dp)) {
                Text(
                    text = "CONSOLE D'EXÉCUTION AUTONOME",
                    color = Color(0xFF64748B),
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.height(2.dp))
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    items(logs) { log ->
                        Text(
                            text = log,
                            color = when {
                                log.startsWith("[OK]") -> Color(0xFF4ADE80)
                                log.startsWith("[ERREUR]") -> Color(0xFFF87171)
                                log.startsWith("[ATTENTE") -> Color(0xFFFACC15)
                                log.startsWith("[REPRISE") -> Color(0xFF38BDF8)
                                log.startsWith("[FABRICE]") -> Color(0xFFFACC15)
                                log.startsWith("[JARVIS]") -> Color(0xFF00F2FE)
                                else -> Color(0xFF38BDF8)
                            },
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier.padding(vertical = 1.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun EmailsTabContent(onExecute: (String) -> Unit) {
    Column(modifier = Modifier.fillMaxSize()) {
        Text("TRIAGE COGNITIF DES COURRIELS", color = Color(0xFF00F2FE), fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
        Spacer(modifier = Modifier.height(8.dp))

        EmailCard(
            sender = "Alexandre Laurent (Technet)",
            subject = "Urgent : Validation WireGuard Port 51820 & APK",
            snippet = "Pouvez-vous me confirmer si le port 51820 et la compilation sont opérationnels ?",
            priority = "URGENT (Score 92%)",
            onReply = { onExecute("Jarvis, confirme à Alexandre que le port 51820 et l'APK sont prêts.") }
        )

        Spacer(modifier = Modifier.height(8.dp))

        EmailCard(
            sender = "Google Play Console",
            subject = "Rapport Jarvis Mobile Companion v3.2",
            snippet = "0 crash détecté, utilisation batterie < 1.2% par 24h.",
            priority = "INFO (Score 35%)",
            onReply = { onExecute("Jarvis, archive le rapport Google Play Console.") }
        )
    }
}

@Composable
fun EmailCard(sender: String, subject: String, snippet: String, priority: String, onReply: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(text = sender, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text(text = priority, color = Color(0xFFF87171), fontSize = 9.sp, fontFamily = FontFamily.Monospace)
            }
            Text(text = subject, color = Color(0xFF38BDF8), fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = snippet, color = Color(0xFF94A3B8), fontSize = 10.sp)
            Spacer(modifier = Modifier.height(6.dp))
            Button(
                onClick = onReply,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("GÉNÉRER RÉPONSE IA", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
    }
}

@Composable
fun PhotosTabContent(onExecute: (String) -> Unit) {
    Column(modifier = Modifier.fillMaxSize()) {
        Text("PHOTOTHÈQUE NAS & PELLICULE XIAOMI 14T PRO", color = Color(0xFF00F2FE), fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
        Spacer(modifier = Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("Dossier de Sauvegarde NAS : /nas/photos/", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text("Visages détectés : Fabrice, Sophie, Camille (ZFS Vault)", color = Color(0xFF38BDF8), fontSize = 10.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { onExecute("Jarvis, lance la synchronisation immédiate des photos de la pellicule Xiaomi.") },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F2FE)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("LANCER SYNCHRONISATION PELLICULE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF030712))
                }
            }
        }
    }
}

@Composable
fun ServerTabContent(onExecute: (String) -> Unit) {
    Column(modifier = Modifier.fillMaxSize()) {
        Text("TÉLÉMÉTRIE HARDWARE & SERVICES", color = Color(0xFF00F2FE), fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
        Spacer(modifier = Modifier.height(8.dp))

        MetricGaugeCard("Processeur (CPU)", 0.12f, "12% - Ryzen 9 7950X")
        Spacer(modifier = Modifier.height(6.dp))
        MetricGaugeCard("Mémoire (RAM)", 0.34f, "34% - 64 GB DDR5")
        Spacer(modifier = Modifier.height(6.dp))
        MetricGaugeCard("Stockage (ZFS Vault)", 0.18f, "18% - 1.4 TB / 8.0 TB")
        Spacer(modifier = Modifier.height(6.dp))
        MetricGaugeCard("Inférence GPU", 0.15f, "15% - NVIDIA RTX 4090")

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = { onExecute("Jarvis, effectue un bilan de santé complet du serveur et du pare-feu UFW.") },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("BILAN COMPLET DU SERVEUR", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
    }
}

@Composable
fun MetricGaugeCard(label: String, progress: Float, detail: String) {
    Card(
        modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF1E293B), RoundedCornerShape(10.dp)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        shape = RoundedCornerShape(10.dp)
    ) {
        Column(modifier = Modifier.padding(8.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(text = label, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                Text(text = detail, color = Color(0xFF38BDF8), fontSize = 10.sp, fontFamily = FontFamily.Monospace)
            }
            Spacer(modifier = Modifier.height(4.dp))
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                color = Color(0xFF00F2FE),
                trackColor = Color(0xFF1E293B)
            )
        }
    }
}

@Composable
fun ArcReactorWidget(
    isThinking: Boolean,
    onClick: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "ArcReactor")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "Rotation"
    )

    val scalePulse by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Pulse"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .size(100.dp)
            .scale(if (isThinking) scalePulse * 1.1f else scalePulse)
            .clickable { onClick() }
    ) {
        Canvas(modifier = Modifier.size(90.dp).rotate(rotation)) {
            val center = Offset(size.width / 2, size.height / 2)
            val radius = size.minDimension / 2

            drawCircle(
                color = Color(0xFF00F2FE).copy(alpha = 0.25f),
                radius = radius,
                style = Stroke(width = 6f)
            )

            for (i in 0 until 12) {
                val angle = (i * 30) * (Math.PI / 180)
                val startX = center.x + (radius - 12) * Math.cos(angle).toFloat()
                val startY = center.y + (radius - 12) * Math.sin(angle).toFloat()
                val endX = center.x + radius * Math.cos(angle).toFloat()
                val endY = center.y + radius * Math.sin(angle).toFloat()
                drawLine(
                    color = Color(0xFF38BDF8),
                    start = Offset(startX, startY),
                    end = Offset(endX, endY),
                    strokeWidth = 3f
                )
            }
        }

        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0xFFE0F2FE), Color(0xFF00F2FE), Color(0xFF0284C7))
                    )
                )
                .border(2.dp, Color.White, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (isThinking) "SCAN" else "JARVIS",
                color = Color(0xFF030712),
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}
