package idlab.technology.solid.webmonetization.provider.impl.http

import idlab.technology.solid.webmonetization.provider.AccessManager
import idlab.technology.solid.webmonetization.provider.utils.OpenIdConfig
import idlab.technology.solid.webmonetization.provider.utils.writeHttpError
import idlab.technology.solid.webmonetization.provider.utils.writeHttpResponse
import io.reactivex.rxkotlin.subscribeBy
import io.vertx.reactivex.core.MultiMap
import io.vertx.reactivex.ext.web.Router
import io.vertx.reactivex.ext.web.client.WebClient
import io.vertx.reactivex.ext.web.handler.StaticHandler
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

@Singleton
class FrontendEndpoint @Inject constructor(router: Router) {
    init {

        router.get("/*")
            .handler(StaticHandler.create())

    }
}
