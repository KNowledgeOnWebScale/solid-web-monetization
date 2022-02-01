package idlab.technology.solid.webmonetization.provider

import com.fasterxml.jackson.annotation.*
import idlab.technology.solid.webmonetization.provider.utils.PaymentPointer
import io.reactivex.Completable
import io.reactivex.Flowable
import io.reactivex.Maybe
import io.reactivex.Single
import io.vertx.core.http.HttpMethod
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.core.http.HttpServerRequest
import java.net.URI
import java.time.Instant
import java.util.*

@JsonIgnoreProperties(ignoreUnknown = true)
data class WMPConfig(
    @JsonProperty("HTTP_PORT")
    val httpPort: Int = 8080,
    @JsonProperty("BASE_URI")
    val baseURI: String = "http://localhost:$httpPort",
    @JsonProperty("MONGO_CONNECTION_STRING")
    val mongoConnectionString: String = "mongodb://localhost:27017",
    @JsonProperty("MONGO_DATABASE_NAME")
    val mongoDatabaseName: String = "demo-wmp",
    @JsonProperty("SUBSCRIPTION_AMOUNT")
    val subscriptionAmount: Long = 5,
    @JsonProperty("SUBSCRIPTION_ASSET_CODE")
    val subscriptionAssetCode: String = "USD",
    @JsonProperty("SUBSCRIPTION_ASSET_SCALE")
    val subscriptionAssetScale: Int = 2,
    @JsonProperty("SUBSCRIPTION_INTERVAL")
    val subscriptionInterval: String = "P1M",
    @JsonProperty("IDP_URI_SOLID_COMMUNITY")
    val idpUriSolidCommunity: String = "https://solidcommunity.net/.well-known/openid-configuration",
    @JsonProperty("CLIENT_ID")
    val clientId: String = "b8c75d654bfe324ccae44f1638d5310c",
    @JsonProperty("CLIENT_SECRET")
    val clientSecret: String = "899fb60c7f7c1b3e67abbaebcaf06904",
    @JsonProperty("REDIRECT_URI")
    val redirectUri: String = "http://localhost:8080/auth/cb",
    @JsonProperty("REDIRECT_URI_POST_LOGOUT")
    val redirectUriPostLogout: String = "http://localhost:8080/auth/logout/cb",
    @JsonProperty("API_PATH")
    val apiPath: String = "/api",
    @JsonProperty("AUTH_PATH")
    val authPath: String = "/auth",
) {

    @JsonIgnore
    val ilpStreamUpdateContext: JsonObject = JsonObject().put("@context", "$baseURI/contexts/ILPStreamUpdate.jsonld")

    @JsonIgnore
    val monetizationSessionContext: JsonObject =
        JsonObject().put("@context", "$baseURI/contexts/MonetizationSession.jsonld")

    @JsonIgnore
    val monetizationSessionInputContext: JsonObject =
        JsonObject().put("@context", "$baseURI/contexts/MonetizationSessionInput.jsonld")

    @JsonIgnore
    val subscriptionContext: JsonObject = JsonObject().put("@context", "$baseURI/contexts/Subscription.jsonld")

    @JsonIgnore
    val subscriptionInputContext: JsonObject =
        JsonObject().put("@context", "$baseURI/contexts/SubscriptionInput.jsonld")
}

interface CryptoManager {
    fun generateDpopProof(method: HttpMethod, endpoint: String): String

    fun getPublicJwks(): JsonObject
}


interface AccessManager {

    fun getToken(request: HttpServerRequest): Single<Token>

}

interface SubscriptionManager {

    // Create a new subscription for the supplied token with the provided input
    fun initSubscription(token: Token, subscriptionInput: SubscriptionInput): Completable

    fun stopSubscription(token: Token): Completable

    // Get a subscription by token (if it exists)
    fun getSubscription(token: Token, checkValidity: Boolean = false): Maybe<Subscription>

    // Get the mandate linked to a subscription (if it exists)
    fun fetchMandate(token: Token): Maybe<OpenPaymentsMandate>

    // Validate a subscription (if it exists), by checking if the referenced Mandate still exists and has not been expired.
    fun validateSubscription(token: Token): Maybe<Boolean>

}

interface SolidPodManager {
    // Check if WebId and issuer have a oidcIssuer relation
    fun isWebIdAndIssuerCorrect(webid: String, issuer: String): Single<Boolean>

    // Check if a supplied Payment Pointer is linked to the Solid Pod represented by the Token
    fun isLinkedPaymentPointer(token: Token, paymentPointer: String): Single<Boolean>

    // Register this WMP with the Solid Pod represented by the Token
    fun registerWMP(token: Token): Completable

    // Unregister this WMP with the Solid Pod represented by the Token
    fun unregisterWMP(token: Token): Completable

}

interface ILPStreamManager {

    // Initiate an ILP stream as a Reactive Flow (subscribe to receive updates, cancel to stop the stream)
    fun streamMoney(target: PaymentPointer): Flowable<ILPStreamUpdate>

}

data class ILPStreamUpdate(
    val amount: Long,
    val assetCode: String,
    val assetScale: Int
)


// TODO eventueel aanvullen met wat nodig is om call te kunnen doen naar Solid Server (optioneel)
data class Token(val userId: String, val podAccessToken: String)

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
data class Subscription(
    @JsonProperty("@id")
    val id: String,
    @JsonProperty("@type")
    val type: String = "Subscription",
    val userId: String,
    val paymentPointer: PaymentPointer,
    val mandateURI: URI,
    val valid: Boolean? = null
) : MongoDocument {
    override fun getMongoId(): String {
        return encodeUrlId(userId)
    }
}

data class SubscriptionInput(
    val paymentPointer: String
)

data class CreateSessionInput(
    val targetPaymentPointer: String
)

data class OpenPaymentsMandate(
    val id: URI,
    val account: URI,
    val amount: Long,
    val assetCode: String,
    val assetScale: Int,
    // https://en.wikipedia.org/wiki/ISO_8601
    val interval: String,
    val startAt: Instant,
    val expiresAt: Instant? = null,
    val balance: Long
)

data class OpenPaymentsMandateInput(
    val amount: Long,
    val assetCode: String,
    val assetScale: Int,
    // https://en.wikipedia.org/wiki/ISO_8601
    val interval: String,
    val startAt: Instant,
    val expiresAt: Instant? = null
)

interface MongoDocument {

    @JsonIgnore
    fun getMongoId(): String

}

fun encodeUrlId(urlId: String): String {
    return Base64.getEncoder().encodeToString(urlId.toByteArray())
}
