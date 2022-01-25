package idlab.technology.solid.webmonetization.provider

import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import idlab.technology.solid.webmonetization.provider.impl.http.*
import io.vertx.core.json.jackson.DatabindCodec
import io.vertx.reactivex.ext.web.Router
import mu.KotlinLogging
import org.codejargon.feather.Feather
import javax.inject.Inject
import javax.inject.Singleton

private val logger = KotlinLogging.logger { }

fun main(args: Array<String>) {
    DatabindCodec.mapper().registerKotlinModule()
    DatabindCodec.prettyMapper().registerKotlinModule()
    Feather.with(IoCBindings()).instance(Launcher::class.java).launch()
}

@Singleton
class Launcher @Inject constructor(
    exampleEndpoint: ExampleEndpoint,
    authEndpoint: AuthEndpoint,
    subscriptionEndpoints: SubscriptionEndpoints,
    monetizedSessionEndpoints: MonetizedSessionEndpoints,
    frontendEndpoint: FrontendEndpoint,
    catchAllEndpoints: CatchAllEndpoints,
    private val router: Router
) {

    fun launch() {
        logger.info { "WMP started!" }
    }

}
