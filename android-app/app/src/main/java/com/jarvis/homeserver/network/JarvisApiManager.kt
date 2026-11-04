package com.jarvis.homeserver.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

object JarvisApiManager {

    private const val LOCAL_WIFI_URL_5000 = "http://192.168.1.98:5000"
    private const val LOCAL_WIFI_URL_3000 = "http://192.168.1.98:3000"
    private const val WIREGUARD_VPN_URL = "http://100.84.12.9:5000"
    private const val DDNS_PUBLIC_URL = "https://fabrice-jarvis-home.duckdns.org:5000"

    suspend fun resolveActiveServerUrl(): String = withContext(Dispatchers.IO) {
        if (pingServer("$LOCAL_WIFI_URL_5000/api/health") || pingServer("$LOCAL_WIFI_URL_5000/api/telemetry")) {
            return@withContext LOCAL_WIFI_URL_5000
        }

        if (pingServer("$LOCAL_WIFI_URL_3000/api/v1/server/telemetry")) {
            return@withContext LOCAL_WIFI_URL_3000
        }

        if (pingServer("$WIREGUARD_VPN_URL/api/health")) {
            return@withContext WIREGUARD_VPN_URL
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
            responseCode in 200..299
        } catch (e: Exception) {
            false
        }
    }
}
