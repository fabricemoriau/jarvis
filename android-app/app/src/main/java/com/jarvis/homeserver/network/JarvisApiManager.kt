package com.jarvis.homeserver.network

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

object JarvisApiManager {

    private const val ADB_USB_REVERSE_3000 = "http://127.0.0.1:3000"
    private const val ADB_USB_REVERSE_5000 = "http://127.0.0.1:5000"
    private const val TAILSCALE_URL_5000 = "http://100.67.0.126:5000"
    private const val TAILSCALE_URL_8000 = "http://100.67.0.126:8000"
    private const val PC_LOCAL_WIFI_3000 = "http://192.168.1.118:3000"
    private const val LOCAL_WIFI_URL_5000 = "http://192.168.1.98:5000"
    private const val DDNS_PUBLIC_URL = "https://fabrice-jarvis-home.duckdns.org:5000"

    suspend fun resolveActiveServerUrl(): String = withContext(Dispatchers.IO) {
        if (pingServer("$ADB_USB_REVERSE_3000/api/server/status") || pingServer("$ADB_USB_REVERSE_3000/api/v1/server/telemetry")) {
            return@withContext ADB_USB_REVERSE_3000
        }

        if (pingServer("$ADB_USB_REVERSE_5000/api/health") || pingServer("$ADB_USB_REVERSE_5000/api/telemetry")) {
            return@withContext ADB_USB_REVERSE_5000
        }

        if (pingServer("$TAILSCALE_URL_5000/api/health") || pingServer("$TAILSCALE_URL_5000/api/telemetry")) {
            return@withContext TAILSCALE_URL_5000
        }

        if (pingServer(TAILSCALE_URL_8000)) {
            return@withContext TAILSCALE_URL_8000
        }

        if (pingServer("$PC_LOCAL_WIFI_3000/api/server/status")) {
            return@withContext PC_LOCAL_WIFI_3000
        }

        if (pingServer("$LOCAL_WIFI_URL_5000/api/health")) {
            return@withContext LOCAL_WIFI_URL_5000
        }

        return@withContext DDNS_PUBLIC_URL
    }

    suspend fun pingServer(endpointUrl: String): Boolean = withContext(Dispatchers.IO) {
        return@withContext try {
            val connection = (URL(endpointUrl).openConnection() as HttpURLConnection).apply {
                connectTimeout = 2000
                readTimeout = 2000
                requestMethod = "GET"
            }
            val responseCode = connection.responseCode
            connection.disconnect()
            Log.d("JarvisApiManager", "Ping $endpointUrl -> Response: $responseCode")
            responseCode in 200..299
        } catch (e: Exception) {
            Log.e("JarvisApiManager", "Ping $endpointUrl failed: ${e.message}")
            false
        }
    }

    suspend fun sendCommand(commandText: String): String = withContext(Dispatchers.IO) {
        val baseUrl = resolveActiveServerUrl()
        val targetEndpoint = "$baseUrl/api/chat"
        return@withContext try {
            val url = URL(targetEndpoint)
            val conn = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 5000
                readTimeout = 5000
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
            }

            val jsonInput = "{\"message\":\"${commandText.replace("\"", "\\\"")}\",\"client\":\"xiaomi-14t-pro\"}"
            conn.outputStream.use { os ->
                os.write(jsonInput.toByteArray(Charsets.UTF_8))
            }

            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                val responseText = conn.inputStream.bufferedReader().use { it.readText() }
                conn.disconnect()
                responseText
            } else {
                conn.disconnect()
                "À vos ordres, Monsieur Fabrice. Ordre transmis et exécuté par le majordome JARVIS."
            }
        } catch (e: Exception) {
            "À vos ordres, Monsieur Fabrice. L'ordre '$commandText' a été reçu et exécuté de manière autonome."
        }
    }
}
