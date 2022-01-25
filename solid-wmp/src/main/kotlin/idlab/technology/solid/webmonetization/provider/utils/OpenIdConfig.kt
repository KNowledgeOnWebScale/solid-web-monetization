package idlab.technology.solid.webmonetization.provider.utils

import io.reactivex.Single
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.ext.web.client.WebClient

class OpenIdConfig(private val client: WebClient, private val uri: String) {
    private val JWKS_URI = "jwks_uri"
    private val ISSUER = "issuer"
    private val AUTHORIZATION_ENDPOINT = "authorization_endpoint"
    private val TOKEN_ENDPOINT = "token_endpoint"
    private val END_SESSION_ENDPOINT = "end_session_endpoint"

    private fun getJson(): Single<JsonObject> {
        return client.getAbs(uri).rxSend().map { it.bodyAsJsonObject() }.cache()
    }

    fun getJwksUri(): Single<String> {
        return getJson().map { it.getString(JWKS_URI) }
    }

    fun getIssuer(): Single<String> {
        return getJson().map { it.getString(ISSUER) }
    }

    fun getAuthorizationEndpoint(): Single<String> {
        return getJson().map { it.getString(AUTHORIZATION_ENDPOINT) }
    }

    fun getTokenEndpoint(): Single<String> {
        return getJson().map { it.getString(TOKEN_ENDPOINT) }
    }

    fun getEndSessionEndpoint(): Single<String> {
        return getJson().map {it.getString(END_SESSION_ENDPOINT)}
    }
}