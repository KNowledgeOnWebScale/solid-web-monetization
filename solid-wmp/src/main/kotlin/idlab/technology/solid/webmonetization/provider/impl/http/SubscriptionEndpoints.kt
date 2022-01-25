package idlab.technology.solid.webmonetization.provider.impl.http

import idlab.technology.solid.webmonetization.provider.*
import idlab.technology.solid.webmonetization.provider.utils.postWithBody
import idlab.technology.solid.webmonetization.provider.utils.writeHttpError
import idlab.technology.solid.webmonetization.provider.utils.writeHttpResponse
import io.reactivex.Single
import io.reactivex.rxkotlin.subscribeBy
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.ext.web.Router
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SubscriptionEndpoints @Inject constructor(
    router: Router,
    private val accessManager: AccessManager,
    private val subscriptionManager: SubscriptionManager,
    config: WMPConfig
) {

    init {

        router.postWithBody("${config.apiPath}/me/subscription").handler { ctx ->
            accessManager.getToken(ctx.request())
                .flatMapCompletable { token ->
                    val subscriptionInput = ctx.bodyAsJson.mapTo(SubscriptionInput::class.java)
                    subscriptionManager.initSubscription(token, subscriptionInput)
                }
                .subscribeBy(
                    onComplete = { ctx.response().setStatusCode(201).end() },
                    onError = writeHttpError(ctx)
                )
        }

        router.get("${config.apiPath}/me/subscription").handler { ctx ->
            accessManager.getToken(ctx.request())
                .flatMapMaybe { token ->
                    subscriptionManager.getSubscription(token = token, checkValidity = true)
                }
                .toSingle()
                .subscribeBy(
                    onSuccess = writeHttpResponse(ctx),
                    onError = writeHttpError(ctx)
                )
        }

        router.get("${config.apiPath}/me/subscription/mandate").handler { ctx ->
            accessManager.getToken(ctx.request())
                .flatMapMaybe { token ->
                    subscriptionManager.fetchMandate(token)
                }
                .toSingle()
                .subscribeBy(
                    onSuccess = writeHttpResponse(ctx),
                    onError = writeHttpError(ctx)
                )
        }

        router.delete("${config.apiPath}/me/subscription").handler { ctx ->
            accessManager.getToken(ctx.request())
                .flatMapCompletable { token ->
                    subscriptionManager.stopSubscription(token)
                }
                .subscribeBy(
                    onComplete = { ctx.response().setStatusCode(204).end() },
                    onError = writeHttpError(ctx)
                )
        }


    }

}
