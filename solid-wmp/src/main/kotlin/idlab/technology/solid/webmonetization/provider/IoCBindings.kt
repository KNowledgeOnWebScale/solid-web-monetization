package idlab.technology.solid.webmonetization.provider

import idlab.technology.solid.webmonetization.provider.impl.auth.LocalAccessManager
import idlab.technology.solid.webmonetization.provider.impl.ilp.MockupILPStreamManager
import idlab.technology.solid.webmonetization.provider.impl.solid.SolidPodManagerImpl
import idlab.technology.solid.webmonetization.provider.impl.subscriptions.MongoSubscriptionManager
import io.vertx.core.http.HttpHeaders
import io.vertx.core.http.HttpMethod
import io.vertx.core.http.HttpServerOptions
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.config.ConfigRetriever
import io.vertx.reactivex.core.Vertx
import io.vertx.reactivex.ext.mongo.MongoClient
import io.vertx.reactivex.ext.web.Router
import io.vertx.reactivex.ext.web.client.WebClient
import io.vertx.reactivex.ext.web.handler.CorsHandler
import org.codejargon.feather.Provides
import javax.inject.Singleton

class IoCBindings {

    @Provides
    @Singleton
    fun vertx(): Vertx {
        return Vertx.vertx()
    }

    @Provides
    @Singleton
    fun router(vertx: Vertx, config: WMPConfig): Router {
        val router = Router.router(vertx)
        val corsHandler = CorsHandler.create("*")
            .allowedMethods(
                mutableSetOf(
                    HttpMethod.GET,
                    HttpMethod.PUT,
                    HttpMethod.POST,
                    HttpMethod.DELETE,
                    HttpMethod.OPTIONS,
                    HttpMethod.HEAD
                )
            )
            .allowedHeaders(
                mutableSetOf(
                    HttpHeaders.ACCEPT.toString(),
                    HttpHeaders.CONTENT_TYPE.toString(),
                    HttpHeaders.AUTHORIZATION.toString(),
                    HttpHeaders.CONTENT_DISPOSITION.toString(),
                    "DPoP"
                )
            )
            .allowCredentials(true)
            .exposedHeaders(
                mutableSetOf(
                    HttpHeaders.CONTENT_DISPOSITION.toString(),
                    HttpHeaders.LOCATION.toString(),
                    "Link"
                )
            )
        router.route().handler(corsHandler)
        vertx.createHttpServer(HttpServerOptions().setCompressionSupported(true)).requestHandler(router)
            .listen(config.httpPort)
        return router
    }

    @Provides
    @Singleton
    fun config(vertx: Vertx): WMPConfig {
        return ConfigRetriever.create(vertx).rxGetConfig()
            .map { it.mapTo(WMPConfig::class.java) }
            .blockingGet()
    }

    @Provides
    @Singleton
    fun webClient(vertx: Vertx): WebClient {
        return WebClient.create(vertx)
    }

    @Provides
    @Singleton
    fun mongoClient(vertx: Vertx, config: WMPConfig): MongoClient {
        val mongoConfig = JsonObject()
            .put("db_name", config.mongoDatabaseName)
            .put("connection_string", config.mongoConnectionString)
        return MongoClient.createShared(vertx, mongoConfig)
    }

    @Provides
    @Singleton
    fun accessManager(keycloakAccessManager: LocalAccessManager): AccessManager {
        return keycloakAccessManager
    }

    @Provides
    @Singleton
    fun subscriptionManager(mongoSubscriptionManager: MongoSubscriptionManager): SubscriptionManager {
        return mongoSubscriptionManager
    }

    @Provides
    @Singleton
    fun podManager(solidPodManagerImpl: SolidPodManagerImpl): SolidPodManager {
        return solidPodManagerImpl
    }

    @Provides
    @Singleton
    fun ilpStreamManager(ilpStreamManager: MockupILPStreamManager): ILPStreamManager {
        return ilpStreamManager
    }

}
