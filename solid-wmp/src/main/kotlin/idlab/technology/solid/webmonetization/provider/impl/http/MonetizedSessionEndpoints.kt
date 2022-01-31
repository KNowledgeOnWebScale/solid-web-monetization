package idlab.technology.solid.webmonetization.provider.impl.http

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import idlab.technology.solid.webmonetization.provider.*
import idlab.technology.solid.webmonetization.provider.utils.*
import io.reactivex.Single
import io.reactivex.rxkotlin.subscribeBy
import io.vertx.core.http.HttpHeaders
import io.vertx.core.json.JsonObject
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions
import io.vertx.reactivex.core.Vertx
import io.vertx.reactivex.ext.web.Router
import io.vertx.reactivex.ext.web.handler.sockjs.SockJSHandler
import io.vertx.reactivex.ext.web.handler.sockjs.SockJSSocket
import mu.KotlinLogging
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MonetizedSessionEndpoints @Inject constructor(
    router: Router,
    vertx: Vertx,
    config: WMPConfig,
    private val accessManager: AccessManager,
    private val subscriptionManager: SubscriptionManager,
    private val ilpStreamManager: ILPStreamManager
) {

    private val logger = KotlinLogging.logger { }
    private val sessions = mutableMapOf<SessionKey, Session>()

    init {

        router.get("${config.apiPath}/me/sessions").handler { ctx ->
            accessManager.getToken(ctx.request())
                .map { token ->
                    sessions.filter { it.key.userId == token.userId }.map { it.value }
                }
                .subscribeBy(
                    onSuccess = writeLDHttpResponse(ctx, config.monetizationSessionContext),
                    onError = writeHttpError(ctx)
                )
        }

        router.get("${config.apiPath}/me/sessions/:sessionId").handler { ctx ->
            accessManager.getToken(ctx.request())
                .flatMap { token ->
                    sessions.filterKeys { it.userId == token.userId && it.sessionId == ctx.pathParam("sessionId") }.values.firstOrNull()
                        ?.let { Single.just(it) } ?: Single.error(NotFoundException())
                }
                .subscribeBy(
                    onSuccess = { session ->
                        ctx.response().putHeader("Link", "<${session.id}/channel>; rel=\"channel\"")
                        writeLDHttpResponse(ctx, config.monetizationSessionContext).invoke(session)
                    },
                    onError = writeHttpError(ctx)
                )
        }

        // Non scoped alias
        router.get("${config.apiPath}/sessions/:sessionId").handler { ctx ->
            accessManager.getToken(ctx.request())
                .flatMap { token ->
                    val result =
                        sessions.filterKeys { it.sessionId == ctx.pathParam("sessionId") }.entries.firstOrNull()
                    if (result == null) {
                        Single.error(NotFoundException())
                    } else {
                        if (result.key.userId == token.userId) {
                            Single.just(result.value)
                        } else {
                            Single.error(UnauthorizedException())
                        }
                    }
                }
                .subscribeBy(
                    onSuccess = { session ->
                        ctx.response().putHeader("Link", "<${session.id}/channel>; rel=\"channel\"")
                        writeLDHttpResponse(ctx, config.monetizationSessionContext).invoke(session)
                    },
                    onError = writeHttpError(ctx)
                )
        }

        router.delete("${config.apiPath}/me/sessions/:sessionId").handler { ctx ->
            accessManager.getToken(ctx.request())
                .flatMap { token ->
                    sessions.filterKeys { it.userId == token.userId && it.sessionId == ctx.pathParam("sessionId") }.values.firstOrNull()
                        ?.let { Single.just(it) } ?: Single.error(NotFoundException())
                }
                .subscribeBy(
                    onSuccess = { session ->
                        session?.activeSocket?.close()
                        ctx.response().setStatusCode(204).end()
                    },
                    onError = writeHttpError(ctx)
                )
        }

        router.postWithBody("${config.apiPath}/me/sessions").handler { ctx ->
            accessManager.getToken(ctx.request())
                .flatMap { token ->
                    val input = ctx.bodyAsJson.mapTo(CreateSessionInput::class.java)
                    subscriptionManager.getSubscription(token, checkValidity = true)
                        .toSingle()
                        .map {
                            val sessionKey = SessionKey(token.userId)
                            val sessionUri = "${config.baseURI}${config.apiPath}/me/sessions/${sessionKey.sessionId}"
                            val session = Session(
                                id = sessionUri,
                                target = PaymentPointer(input.targetPaymentPointer),
                                assetScale = config.subscriptionAssetScale,
                                assetCode = config.subscriptionAssetCode
                            )
                            sessions[sessionKey] = session
                            sessionUri
                        }
                }
                .subscribeBy(
                    onSuccess = { sessionUri ->
                        ctx.response()
                            .putHeader(HttpHeaders.LOCATION.toString(), sessionUri)
                            .setStatusCode(201)
                            .end()
                    },
                    onError = writeHttpError(ctx)
                )
        }

        val webSocketHandler = SockJSHandler.create(vertx, SockJSHandlerOptions().setHeartbeatInterval(2000))

        router.mountSubRouter(
            "${config.apiPath}/me/sessions/:sessionId/channel",
            webSocketHandler.socketHandler(::channelSocketHandler)
        )

        // Non-scoped alias
        router.mountSubRouter(
            "${config.apiPath}/sessions/:sessionId/channel",
            webSocketHandler.socketHandler(::channelSocketHandler)
        )
    }

    private fun channelSocketHandler(socket: SockJSSocket) {
        val sessionId = socket.routingContext().pathParam("sessionId")
        val sessionKey = sessions.keys.find { it.sessionId == sessionId }
        if (sessionKey != null) {
            logger.info { "Initializing session channel for session $sessionId (user: ${sessionKey.userId})..." }
            val session = sessions[sessionKey]!!
            session.activeSocket = socket
            val ilpStream = ilpStreamManager.streamMoney(session.target)
                .flatMapCompletable { update ->
                    // Update session
                    session.totalAmountTransferred += update.amount
                    // Notify client via socket
                    socket.rxWrite(JsonObject.mapFrom(update).encode()).onErrorLogAndComplete(logger)
                }
                .subscribeBy(
                    onError = { err -> logger.warn(err) { "Error while streaming money for session $sessionId!" } }
                )
            socket.closeHandler {
                ilpStream.dispose()
                sessions.remove(sessionKey)
                logger.info { "Session $session was closed!" }
            }
        } else {
            val errorMsg =
                "Error while opening a session channel: session with id $sessionId could not be found!"
            logger.warn { errorMsg }
            socket.rxWrite(JsonObject().put("error", errorMsg).encode())
                .doFinally { socket.close() }
                .subscribe()
        }
    }

}

data class SessionKey(val userId: String, val sessionId: String = UUID.randomUUID().toString())

data class Session(
    @JsonProperty("@id")
    val id: String,
    @JsonProperty("@type")
    val type: String = "MonetizationSession",
    val target: PaymentPointer,
    @JsonIgnore
    var activeSocket: SockJSSocket? = null,
    var totalAmountTransferred: Long = 0,
    val assetCode: String,
    val assetScale: Int,
) {

    fun isActive(): Boolean {
        return activeSocket != null
    }

}
