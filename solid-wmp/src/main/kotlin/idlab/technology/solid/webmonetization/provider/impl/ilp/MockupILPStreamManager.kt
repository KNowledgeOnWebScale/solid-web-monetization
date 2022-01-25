package idlab.technology.solid.webmonetization.provider.impl.ilp

import idlab.technology.solid.webmonetization.provider.ILPStreamManager
import idlab.technology.solid.webmonetization.provider.ILPStreamUpdate
import idlab.technology.solid.webmonetization.provider.WMPConfig
import idlab.technology.solid.webmonetization.provider.utils.PaymentPointer
import idlab.technology.solid.webmonetization.provider.utils.onErrorLogAndComplete
import io.reactivex.Completable
import io.reactivex.Flowable
import io.reactivex.Single
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.core.http.HttpHeaders
import io.vertx.reactivex.ext.web.client.WebClient
import mu.KotlinLogging
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

private const val baseUri = "https://hermes-rest.ilpv4.dev/accounts"
private const val PAYMENT_RATE_SECONDS = 10L // Stream payment every 10 secs the user is using the web application
private const val FUND_RATE_FACTOR = 10L
private const val PAYMENT_AMOUNT_SCALE_9 = 2777778L // At a rate of ~ 1 XRP per hour

@Singleton
class MockupILPStreamManager @Inject constructor(private val config: WMPConfig, private val webClient: WebClient) :
    ILPStreamManager {

    private val logger = KotlinLogging.logger { }
    private var tmpCredentials: TestnetCredentials? = null

    override fun streamMoney(target: PaymentPointer): Flowable<ILPStreamUpdate> {
        return Flowable.interval(PAYMENT_RATE_SECONDS, PAYMENT_RATE_SECONDS, TimeUnit.SECONDS)
            .flatMapSingle { i ->
                if (i == 0L || (i % FUND_RATE_FACTOR) == 0L) {
                    generateFunds().toSingleDefault(i)
                } else {
                    Single.just(i)
                }
            }
            .flatMapSingle {
                performStreamPayment(PAYMENT_AMOUNT_SCALE_9, target).toSingleDefault(
                    ILPStreamUpdate(
                        PAYMENT_AMOUNT_SCALE_9, "XRP", 9
                    )
                )
            }
    }

    private fun performStreamPayment(amount: Long, target: PaymentPointer, retry: Boolean = false): Completable {
        return getCredentials()
            .flatMapCompletable { credentials ->
                webClient.postAbs("$baseUri/${credentials.accountId}/pay")
                    .putHeader(HttpHeaders.AUTHORIZATION.toString(), "Bearer ${credentials.secret}")
                    .rxSendJsonObject(JsonObject().put("amount", amount).put("destinationPaymentPointer", target.value))
                    .flatMapCompletable { resp ->
                        if (resp.statusCode() == 200) {
                            Completable.complete()
                        } else if (!retry && resp.statusCode() == 401) {
                            // Invalidate stored credentials
                            tmpCredentials = null
                            // Retry
                            performStreamPayment(amount, target, true)
                        } else {
                            Completable.error(RuntimeException("Failed to perform payment to ${target.value}..."))
                        }
                    }
            }
    }

    private fun generateFunds(retry: Boolean = false): Completable {
        return getCredentials()
            .flatMapCompletable { credentials ->
                webClient.postAbs("$baseUri/${credentials.accountId}/money")
                    .rxSendJson("")
                    .flatMapCompletable { resp ->
                        if (resp.statusCode() == 200) {
                            Completable.complete()
                        } else if (!retry && resp.statusCode() == 401) {
                            // Invalidate stored credentials
                            tmpCredentials = null
                            // Retry
                            generateFunds(true)
                        } else {
                            Completable.error(RuntimeException("Could not generate funds for the WMP account!"))
                        }
                    }
            }
    }

    private fun getCredentials(): Single<TestnetCredentials> {
        val request =
            "{\"accountId\":null,\"assetCode\":\"XRP\",\"assetScale\":9,\"receiveRoutes\":false,\"sendRoutes\":false}"
        return tmpCredentials?.let { Single.just(it) } ?: webClient.postAbs(baseUri)
            .rxSendJsonObject(JsonObject(request))
            .map { resp ->
                if (resp.statusCode() == 200) {
                    try {
                        val json = resp.bodyAsJsonObject()
                        TestnetCredentials(
                            json.getString("accountId"),
                            json.getJsonObject("customSettings").getString("ilpOverHttp.incoming.simple.auth_token")
                        )
                    } catch (t: Throwable) {
                        throw IllegalArgumentException("Could not parse credentials!", t)
                    }
                } else {
                    throw RuntimeException("Failed to generate credentials: ${resp.bodyAsString()}")
                }
            }
            .doOnSuccess { tmpCredentials = it }
    }
}

data class TestnetCredentials(
    val accountId: String,
    val secret: String
)
