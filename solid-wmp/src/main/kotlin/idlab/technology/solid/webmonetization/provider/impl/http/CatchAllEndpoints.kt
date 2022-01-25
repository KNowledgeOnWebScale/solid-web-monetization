package idlab.technology.solid.webmonetization.provider.impl.http

import idlab.technology.solid.webmonetization.provider.WMPConfig
import io.vertx.reactivex.ext.web.Router
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CatchAllEndpoints @Inject constructor(router: Router, config: WMPConfig) {
    init {

        // Catch-all for non-existent API routes to return a Not Found status code
        router.route("${config.apiPath}/*").handler { it.response().setStatusCode(404).end() };

        // Catch-all for non-existent AUTH routes to return a Not Found Request status code
        router.route("${config.authPath}/*").handler { it.response().setStatusCode(404).end() };

        // Catch-all for other resources, to reroute to SPA page
        router.get().handler { it.response().sendFile("webroot/index.html") }
    }
}
