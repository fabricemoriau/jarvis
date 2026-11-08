package com.jarvis.homeserver

import android.os.Bundle
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
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF030712)
                ) {
                    JarvisHudDashboard()
                }
            }
        }
    }
}

@Composable
fun JarvisHudDashboard() {
    val coroutineScope = rememberCoroutineScope()
    var connectionStatus by remember { mutableStateOf("Initialisation de la liaison...") }
    var activeEndpoint by remember { mutableStateOf("Analyse des nœuds...") }
    var isConnected by remember { mutableStateOf(false) }
    var isThinking by remember { mutableStateOf(false) }
    var inputText by remember { mutableStateOf("") }
    
    val logs = remember { mutableStateListOf(
        "[SYSTEME] Boot JARVIS Mobile Companion v2.6",
        "[POUVOIRS] Contrôle total et exécution autonome activés.",
        "[SERVEUR] Démon Python 100.67.0.126 & 192.168.1.98 prêts."
    ) }

    fun refreshNetworkStatus() {
        coroutineScope.launch {
            isThinking = true
            logs.add(0, "[ANALYSE] Test de latence et vérification du pare-feu...")
            val activeUrl = JarvisApiManager.resolveActiveServerUrl()
            activeEndpoint = activeUrl
            val pingSuccess = JarvisApiManager.pingServer(activeUrl)
            isConnected = pingSuccess
            isThinking = false
            if (pingSuccess) {
                connectionStatus = "Connecté & Synchronisé 24/7"
                logs.add(0, "[OK] Liaison établie sur : $activeUrl")
            } else {
                connectionStatus = "Alerte : Injoignable (Vérifiez VPN/Wi-Fi)"
                logs.add(0, "[ERREUR] Impossible de contacter $activeUrl")
            }
        }
    }

    fun executeOrder(cmd: String) {
        if (cmd.isNotBlank()) {
            coroutineScope.launch {
                logs.add(0, "[FABRICE] $cmd")
                isThinking = true
                val reply = JarvisApiManager.sendCommand(cmd)
                isThinking = false
                logs.add(0, "[JARVIS] $reply")
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshNetworkStatus()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF030712), Color(0xFF0B132B), Color(0xFF030712))
                )
            )
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // --- 1. HEADER HUD ---
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "J.A.R.V.I.S. HUD",
                    color = Color(0xFF00F2FE),
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "MAJORDOME SOUVERAIN • XIAOMI 14T PRO",
                    color = Color(0xFF64748B),
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isConnected) Color(0xFF052E16) else Color(0xFF450A0A))
                    .border(1.dp, if (isConnected) Color(0xFF22C55E) else Color(0xFFEF4444), RoundedCornerShape(12.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = if (isConnected) "EN LIGNE" else "HORS LIGNE",
                    color = if (isConnected) Color(0xFF4ADE80) else Color(0xFFFCA5A5),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // --- 2. ARC REACTOR CORE ANIMATION ---
        ArcReactorWidget(
            isThinking = isThinking,
            onClick = { refreshNetworkStatus() }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // --- 3. TELEMETRY NETWORK CARD ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF00F2FE).copy(alpha = 0.3f), RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A).copy(alpha = 0.8f)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = "LIAISON SERVEUR DOMESTIQUE",
                    color = Color(0xFF00F2FE),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "Statut : ", color = Color(0xFF94A3B8), fontSize = 11.sp)
                    Text(text = connectionStatus, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
                Spacer(modifier = Modifier.height(2.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "Point d'accès : ", color = Color(0xFF94A3B8), fontSize = 11.sp)
                    Text(text = activeEndpoint, color = Color(0xFF38BDF8), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // --- 4. COMMAND OMNIBAR INPUT ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Tapez n'importe quel ordre pour JARVIS...", color = Color(0xFF64748B), fontSize = 11.sp) },
                modifier = Modifier.weight(1f),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF00F2FE),
                    unfocusedBorderColor = Color(0xFF1E293B),
                    focusedContainerColor = Color(0xFF0F172A),
                    unfocusedContainerColor = Color(0xFF0B132B),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            Button(
                onClick = {
                    val cmd = inputText.trim()
                    inputText = ""
                    executeOrder(cmd)
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F2FE)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("EXÉCUTER", color = Color(0xFF030712), fontWeight = FontWeight.Bold, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // --- 5. QUICK ACTIONS HUD GRID ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            QuickActionButton(
                label = "📧 Mails",
                desc = "Urgent Triage",
                modifier = Modifier.weight(1f)
            ) {
                executeOrder("Jarvis, fais le triage de mes mails urgents.")
            }

            QuickActionButton(
                label = "📸 Sync NAS",
                desc = "Photos Xiaomi",
                modifier = Modifier.weight(1f)
            ) {
                executeOrder("Jarvis, synchronise mes photos sur le serveur.")
            }

            QuickActionButton(
                label = "🔄 Test Réseau",
                desc = "Tailscale / VPN",
                modifier = Modifier.weight(1f)
            ) {
                refreshNetworkStatus()
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // --- 6. TERMINAL LOG CONSOLE ---
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF020617)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                Text(
                    text = "CONSOLE D'EXÉCUTION AUTONOME",
                    color = Color(0xFF64748B),
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.height(4.dp))
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    items(logs) { log ->
                        Text(
                            text = log,
                            color = when {
                                log.startsWith("[OK]") -> Color(0xFF4ADE80)
                                log.startsWith("[ERREUR]") -> Color(0xFFF87171)
                                log.startsWith("[FABRICE]") -> Color(0xFFFACC15)
                                log.startsWith("[JARVIS]") -> Color(0xFF00F2FE)
                                else -> Color(0xFF38BDF8)
                            },
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier.padding(vertical = 2.dp)
                        )
                    }
                }
            }
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
            .size(120.dp)
            .scale(if (isThinking) scalePulse * 1.1f else scalePulse)
            .clickable { onClick() }
    ) {
        Canvas(modifier = Modifier.size(110.dp).rotate(rotation)) {
            val center = Offset(size.width / 2, size.height / 2)
            val radius = size.minDimension / 2

            drawCircle(
                color = Color(0xFF00F2FE).copy(alpha = 0.25f),
                radius = radius,
                style = Stroke(width = 8f)
            )

            for (i in 0 until 12) {
                val angle = (i * 30) * (Math.PI / 180)
                val startX = center.x + (radius - 14) * Math.cos(angle).toFloat()
                val startY = center.y + (radius - 14) * Math.sin(angle).toFloat()
                val endX = center.x + radius * Math.cos(angle).toFloat()
                val endY = center.y + radius * Math.sin(angle).toFloat()
                drawLine(
                    color = Color(0xFF38BDF8),
                    start = Offset(startX, startY),
                    end = Offset(endX, endY),
                    strokeWidth = 4f
                )
            }
        }

        Box(
            modifier = Modifier
                .size(52.dp)
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
                text = if (isThinking) "EXEC" else "JARVIS",
                color = Color(0xFF030712),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

@Composable
fun QuickActionButton(
    label: String,
    desc: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = label, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = desc, color = Color(0xFF64748B), fontSize = 9.sp, fontFamily = FontFamily.Monospace)
        }
    }
}
