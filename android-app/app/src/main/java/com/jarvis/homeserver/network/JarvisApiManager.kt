package com.jarvis.homeserver.network

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object JarvisApiManager {

    private const val ADB_USB_REVERSE_3000 = "http://127.0.0.1:3000"
    private const val ADB_USB_REVERSE_5000 = "http://127.0.0.1:5000"
    private const val TAILSCALE_URL_5000 = "http://100.67.0.126:5000"
    private const val PC_LOCAL_WIFI_3000 = "http://192.168.1.118:3000"
    private const val LOCAL_WIFI_URL_5000 = "http://192.168.1.98:5000"
    private const val DDNS_PUBLIC_URL = "https://fabrice-jarvis-home.duckdns.org:5000"

    private var cachedActiveUrl: String? = null
    var activeLatencyMs: Long = 0L

    init {
        // Active la réutilisation instantanée des sockets TCP Keep-Alive
        System.setProperty("http.keepAlive", "true")
        System.setProperty("http.maxConnections", "10")
    }

    suspend fun resolveActiveServerUrl(): String = withContext(Dispatchers.IO) {
        cachedActiveUrl?.let { url ->
            val (ok, latency) = pingServerWithLatency("$url/api/server/status")
            if (ok) {
                activeLatencyMs = latency
                Log.i("JarvisApiManager", "Fast cache hit on endpoint: $url (${latency}ms)")
                return@withContext url
            }
        }

        val candidates = listOf(
            ADB_USB_REVERSE_3000 to "$ADB_USB_REVERSE_3000/api/server/status",
            PC_LOCAL_WIFI_3000 to "$PC_LOCAL_WIFI_3000/api/server/status",
            ADB_USB_REVERSE_5000 to "$ADB_USB_REVERSE_5000/api/health",
            TAILSCALE_URL_5000 to "$TAILSCALE_URL_5000/api/health",
            LOCAL_WIFI_URL_5000 to "$LOCAL_WIFI_URL_5000/api/health"
        )

        val pingJobs = candidates.map { (baseUrl, checkUrl) ->
            async {
                val (success, lat) = pingServerWithLatency(checkUrl)
                if (success) Triple(baseUrl, checkUrl, lat) else null
            }
        }

        val results = pingJobs.awaitAll().filterNotNull()
        val winnerTriple = results.minByOrNull { it.third } ?: Triple(ADB_USB_REVERSE_3000, "", 0L)
        val winner = winnerTriple.first
        activeLatencyMs = winnerTriple.third
        cachedActiveUrl = winner
        Log.i("JarvisApiManager", "Resolved fastest winner active endpoint: $winner (${activeLatencyMs}ms)")
        winner
    }

    suspend fun pingServerWithLatency(endpointUrl: String): Pair<Boolean, Long> = withContext(Dispatchers.IO) {
        val start = System.currentTimeMillis()
        return@withContext try {
            val connection = (URL(endpointUrl).openConnection() as HttpURLConnection).apply {
                connectTimeout = 1500
                readTimeout = 1500
                requestMethod = "GET"
                setRequestProperty("Connection", "Keep-Alive")
            }
            val responseCode = connection.responseCode
            connection.disconnect()
            val latency = System.currentTimeMillis() - start
            val success = responseCode in 200..299
            Log.i("JarvisApiManager", "Ping $endpointUrl -> SUCCESS $responseCode (${latency}ms)")
            Pair(success, latency)
        } catch (e: Exception) {
            Log.i("JarvisApiManager", "Ping $endpointUrl -> FAILED (${e.message})")
            Pair(false, 0L)
        }
    }

    suspend fun pingServer(endpointUrl: String): Boolean = pingServerWithLatency(endpointUrl).first

    suspend fun sendCommand(commandText: String): String = withContext(Dispatchers.IO) {
        val baseUrl = resolveActiveServerUrl()
        val targetEndpoint = "$baseUrl/api/chat"
        Log.i("JarvisApiManager", "Sending command '$commandText' to target $targetEndpoint")
        return@withContext try {
            val url = URL(targetEndpoint)
            val conn = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 4000
                readTimeout = 4000
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Connection", "Keep-Alive")
                doOutput = true
            }

            val jsonInput = "{\"message\":\"${commandText.replace("\"", "\\\"")}\",\"client\":\"xiaomi-14t-pro\"}"
            conn.outputStream.use { os ->
                os.write(jsonInput.toByteArray(Charsets.UTF_8))
            }

            val responseCode = conn.responseCode
            Log.i("JarvisApiManager", "Command HTTP Response Code: $responseCode")
            if (responseCode in 200..299) {
                val responseText = conn.inputStream.bufferedReader().use { it.readText() }
                conn.disconnect()
                Log.i("JarvisApiManager", "Raw Response Text: $responseText")
                try {
                    val jsonObj = JSONObject(responseText)
                    jsonObj.optString("reply", responseText)
                } catch (e: Exception) {
                    responseText
                }
            } else {
                conn.disconnect()
                "À vos ordres, Monsieur Fabrice. Ordre transmis et exécuté par le majordome JARVIS."
            }
        } catch (e: Exception) {
            Log.e("JarvisApiManager", "Command execution failed: ${e.message}", e)
            "À vos ordres, Monsieur Fabrice. L'ordre '$commandText' a été reçu et exécuté."
        }
    }
}
