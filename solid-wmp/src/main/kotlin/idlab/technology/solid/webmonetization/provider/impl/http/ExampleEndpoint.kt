package idlab.technology.solid.webmonetization.provider.impl.http

import idlab.technology.solid.webmonetization.provider.AccessManager
import idlab.technology.solid.webmonetization.provider.WMPConfig
import idlab.technology.solid.webmonetization.provider.utils.writeHttpError
import idlab.technology.solid.webmonetization.provider.utils.writeHttpResponse
import io.reactivex.rxkotlin.subscribeBy
import io.vertx.reactivex.core.MultiMap
import io.vertx.reactivex.ext.web.Router
import io.vertx.reactivex.ext.web.client.WebClient
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

@Singleton
class ExampleEndpoint @Inject constructor(router: Router, private val accessManager: AccessManager, config: WMPConfig) {
    init {
        router.get("${config.apiPath}/me").handler { ctx ->
            accessManager.getToken(ctx.request())
                .subscribeBy(
                    onSuccess = writeHttpResponse(ctx),
                    onError = writeHttpError(ctx)
                )
        }
    }

}
