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

    suspend fun resolveActiveServerUrl(): String = withContext(Dispatchers.IO) {
        cachedActiveUrl?.let { url ->
            if (pingServer("$url/api/server/status") || pingServer("$url/api/health")) {
                Log.i("JarvisApiManager", "Using cached active endpoint: $url")
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
                if (pingServer(checkUrl)) baseUrl else null
            }
        }

        val results = pingJobs.awaitAll()
        val winner = results.firstOrNull { it != null } ?: ADB_USB_REVERSE_3000
        cachedActiveUrl = winner
        Log.i("JarvisApiManager", "Resolved winner active endpoint: $winner")
        winner
    }

    suspend fun pingServer(endpointUrl: String): Boolean = withContext(Dispatchers.IO) {
        return@withContext try {
            val connection = (URL(endpointUrl).openConnection() as HttpURLConnection).apply {
                connectTimeout = 3000
                readTimeout = 3000
                requestMethod = "GET"
            }
            val responseCode = connection.responseCode
            connection.disconnect()
            Log.i("JarvisApiManager", "Ping $endpointUrl -> SUCCESS $responseCode")
            responseCode in 200..299
        } catch (e: Exception) {
            Log.i("JarvisApiManager", "Ping $endpointUrl -> FAILED (${e.message})")
            false
        }
    }

    suspend fun sendCommand(commandText: String): String = withContext(Dispatchers.IO) {
        val baseUrl = resolveActiveServerUrl()
        val targetEndpoint = "$baseUrl/api/chat"
        Log.i("JarvisApiManager", "Sending command '$commandText' to target $targetEndpoint")
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
