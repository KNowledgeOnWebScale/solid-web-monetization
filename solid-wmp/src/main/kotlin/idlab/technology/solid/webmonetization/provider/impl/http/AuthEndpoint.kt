package idlab.technology.solid.webmonetization.provider.impl.http

import idlab.technology.solid.webmonetization.provider.AccessManager
import idlab.technology.solid.webmonetization.provider.CryptoManager
import idlab.technology.solid.webmonetization.provider.WMPConfig
import idlab.technology.solid.webmonetization.provider.utils.BadRequestException
import idlab.technology.solid.webmonetization.provider.utils.OpenIdConfig
import idlab.technology.solid.webmonetization.provider.utils.writeHttpError
import io.reactivex.Single
import io.reactivex.rxkotlin.subscribeBy
import io.vertx.core.http.HttpHeaders
import io.vertx.core.http.HttpMethod
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.core.MultiMap
import io.vertx.reactivex.core.buffer.Buffer
import io.vertx.reactivex.ext.web.Router
import io.vertx.reactivex.ext.web.client.WebClient
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthEndpoint @Inject constructor(
    router: Router,
    private val cryptoManager: CryptoManager,
    private val client: WebClient,
    private val config: WMPConfig
) {
    private val oidc = OpenIdConfig(client, config.idpUriSolidCommunity)


    init {
        /**
         * Publish public JWKset
         */
        router.get("${config.authPath}/jwks").handler { it.end(cryptoManager.getPublicJwks().encode()) }

        /**
         * Initial login start
         */
        router.get("${config.authPath}/login").handler { ctx ->
            // Read query parameters
            val cb = ctx.queryParam("cb").firstOrNull();
            if (cb == null) ctx.fail(400, BadRequestException("no cb defined"));

            // Redirect to solidcommunity.net auth page and start flow
            val query = "?response_type=code" +
                    "&scope=openid webid offline_access" +
                    "&client_id=${config.clientId}" +
                    "&redirect_uri=${config.baseURI}${config.authPath}/cb" +
                    "&state=" + Base64.getUrlEncoder().encodeToString(cb!!.toByteArray(Charsets.UTF_8))
            "&nonce=" + // TODO: nonce
                    "&prompt=select_account"
            oidc.getAuthorizationEndpoint().subscribeBy(
                onSuccess = { ctx.redirect(it + query); },
                onError = writeHttpError(ctx)
            )

        }

        /**
         * Logout start passthrough
         */
        router.get("${config.authPath}/logout").handler { ctx ->
            // Read query parameters
            val cb = ctx.queryParam("cb").firstOrNull();
            val it = ctx.queryParam("it").firstOrNull();
            if (cb.isNullOrEmpty()) {
                ctx.fail(400, BadRequestException("no cb defined"));
                return@handler;
            };
            if (it.isNullOrEmpty()) {
                ctx.fail(400, BadRequestException("no it defined"));
                return@handler;
            };

            // Redirect to solidcommunity.net auth page and start flow
            val query = "?post_logout_redirect_uri=${config.baseURI}${config.authPath}/logout/cb&id_token_hint=$it&state=$cb";
            oidc.getEndSessionEndpoint().subscribeBy(
                onSuccess = { ctx.redirect(it + query); },
                onError = writeHttpError(ctx)
            )
        }

        router.get("${config.authPath}/logout/cb").handler { ctx ->
            // Read query parameters
            val state = ctx.queryParam("state").firstOrNull();
            if (state.isNullOrEmpty()) ctx.response().setStatusCode(500).setStatusMessage("no state defined");
            println(state)

            // Redirect to solidcommunity.net auth page and start flow
            ctx.redirect(state);
        }


        /**
         * Callback handler for code to token exchange
         */
        router.get("${config.authPath}/cb").handler { ctx ->
            val code = ctx.queryParam("code").first()
            val state = ctx.queryParam("state").firstOrNull()
            val cb = Base64.getUrlDecoder().decode(state).toString(Charsets.UTF_8)
            dPoPExchange(code, state)
                .subscribeBy(
                    onSuccess = { ctx.redirect("$cb?at=${it.getString("access_token")}&it=${it.getString("id_token")}") },
                    onError = writeHttpError(ctx)
                )
        }

    }

    private fun dPoPExchange(code: String, state: String?): Single<JsonObject> {
        return oidc.getTokenEndpoint()
            .flatMap { endpoint ->
                client.postAbs(endpoint)
                    .basicAuthentication(config.clientId, config.clientSecret)
                    .putHeader("DPoP", cryptoManager.generateDpopProof(HttpMethod.POST, endpoint))
                    .rxSendForm(
                        MultiMap.caseInsensitiveMultiMap()
                            .add("grant_type", "authorization_code")
                            .add("code", code)
                            .add("redirect_uri", "${config.baseURI}${config.authPath}/cb")
                            .add("state", state.orEmpty())
                    )
//                    .doOnSuccess { println(it.bodyAsString()) }
                    .map { it.bodyAsJsonObject() }
            }
    }

    private fun legacyExchange(code: String, state: String?): Single<JsonObject> {
        return oidc.getTokenEndpoint()
            .flatMap { endpoint ->
                client.postAbs(endpoint)
                    .basicAuthentication(config.clientId, config.clientSecret)
                    .rxSendForm(
                        MultiMap.caseInsensitiveMultiMap()
                            .add("grant_type", "authorization_code")
                            .add("code", code)
                            .add("redirect_uri", "${config.baseURI}${config.authPath}/cb")
                            .add("state", state.orEmpty())
                    )
                    .map { it.bodyAsJsonObject() }
            }
    }

    fun testPatchName(accessToken: String) {
        val method = HttpMethod.PATCH
        val endpoint = "https://tdupont-td.solidcommunity.net/profile/card"
        val body =
            "DELETE DATA { <https://tdupont-td.solidcommunity.net/profile/card#me> <http://www.w3.org/2006/vcard/ns#organization-name> \"\" . } " +
                    "; INSERT DATA { <https://tdupont-td.solidcommunity.net/profile/card#me> <http://www.w3.org/2006/vcard/ns#organization-name> \"IDLab\" . }"
        val dpop = cryptoManager.generateDpopProof(method, endpoint)
        println("DPoP: " + dpop)
        println("Patching profile card:")
        client.patchAbs(endpoint)
            .putHeader(HttpHeaders.AUTHORIZATION.toString(), "DPoP $accessToken")
            .putHeader("DPoP", dpop)
            .putHeader(HttpHeaders.CONTENT_TYPE.toString(), "application/sparql-update")
            .rxSendBuffer(Buffer.buffer(body)).subscribeBy(
                onSuccess = { println("${it.statusCode()} ${it.bodyAsString()}") },
                onError = { println("${it.message}") }
            )
    }
}


