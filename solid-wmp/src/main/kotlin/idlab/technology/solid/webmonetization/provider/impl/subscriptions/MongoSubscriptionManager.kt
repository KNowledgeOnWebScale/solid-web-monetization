package idlab.technology.solid.webmonetization.provider.impl.subscriptions

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import idlab.technology.solid.webmonetization.provider.*
import idlab.technology.solid.webmonetization.provider.utils.BadRequestException
import idlab.technology.solid.webmonetization.provider.utils.PaymentPointer
import idlab.technology.solid.webmonetization.provider.utils.flatMap
import io.reactivex.Completable
import io.reactivex.Maybe
import io.reactivex.Single
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.ext.mongo.MongoClient
import java.net.URI
import java.time.Instant
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

private const val MONGO_SUBSCRIPTION_COLLECTION = "subscriptions"
private const val MONGO_MOCKUP_MANDATE_COLLECTION = "mockup-mandates"

@Singleton
class MongoSubscriptionManager @Inject constructor(
    private val config: WMPConfig,
    private val mongoClient: MongoClient,
    private val podManager: SolidPodManager
) :
    SubscriptionManager {
    override fun initSubscription(token: Token, subscriptionInput: SubscriptionInput): Completable {
        // 1. Check if the user Pod has the provided payment pointer
        return podManager.isLinkedPaymentPointer(token, subscriptionInput.paymentPointer)
            .flatMapCompletable { linkedPaymentPointer ->
                if (linkedPaymentPointer) {
                    // 2. Create the Open Payments Mandate using the Payment Pointer provided by the User
                    val paymentPointer = PaymentPointer(subscriptionInput.paymentPointer)
                    postMandate(
                        token, paymentPointer, OpenPaymentsMandateInput(
                            amount = config.subscriptionAmount,
                            assetCode = config.subscriptionAssetCode,
                            assetScale = config.subscriptionAssetScale,
                            interval = config.subscriptionInterval,
                            startAt = Instant.now(),
                        )
                    )
                        .flatMapCompletable { mandateURI ->
                            // 3. Create the subscription (and store in MongoDB)
                            val subscription = Subscription(
                                userId = token.userId,
                                paymentPointer = paymentPointer,
                                mandateURI = mandateURI
                            )
                            mongoClient.rxSave(MONGO_SUBSCRIPTION_COLLECTION, toDocument(subscription)).ignoreElement()
                        }
                } else {
                    Completable.error(BadRequestException("Solid Pod for user ${token.userId} does not have a registered Payment Pointer matching ${subscriptionInput.paymentPointer}!"))
                }
            }
            // 3. If the previous operations were successful, this WMP can be registered with the Solid Pod of the User.
            .flatMap { podManager.registerWMP(token) }
    }

    override fun stopSubscription(token: Token): Completable {
        /**
         * 1. Delete the subscription
         *
         * The Mandate will still exist, but the WMP should no longer generate invoices to be charged upon this
         * Mandate, as the Invoice generation process should trigger based on the existing subscriptions...
         * (Not implemented for this demo)
         */
        return mongoClient.rxFindOneAndDelete(
            MONGO_SUBSCRIPTION_COLLECTION,
            JsonObject().put("_id", encodeUrlId(token.userId))
        )
            .isEmpty()
            .flatMapCompletable { noResults ->
                if (noResults) {
                    Completable.error(BadRequestException("A subscription for user ${token.userId} does not exist and thus cannot be stopped!"))
                } else {
                    // 2. Unregister this WMP from the User Solid Pod (it will no longer act as the User's monetization broker).
                    podManager.unregisterWMP(token)
                }
            }
    }

    override fun getSubscription(token: Token, checkValidity: Boolean): Maybe<Subscription> {
        return mongoClient.rxFindOne(
            MONGO_SUBSCRIPTION_COLLECTION,
            JsonObject().put("_id", encodeUrlId(token.userId)),
            JsonObject()
        )
            .map { it.mapTo(Subscription::class.java) }
            .flatMap { subscription ->
                if (checkValidity) {
                    validateSubscription(token)
                        .map {
                            subscription.copy(valid = it)
                        }
                        .defaultIfEmpty(subscription)
                } else {
                    Maybe.just(subscription)
                }
            }
    }

    override fun fetchMandate(token: Token): Maybe<OpenPaymentsMandate> {
        // Proxies the Mandate for the target Wallet
        // (In this demo this is implemented using a local mockup, real implementations should target the user Wallet)
        return mongoClient.rxFindOne(
            MONGO_MOCKUP_MANDATE_COLLECTION,
            JsonObject().put(
                "_id",
                encodeUrlId(token.userId)
            ),
            JsonObject()
        )
            .map { it.mapTo(OpenPaymentsMandateWrapper::class.java).mandate }
    }

    override fun validateSubscription(token: Token): Maybe<Boolean> {
        // 1. Fetch the subscription
        return getSubscription(token, false)
            .flatMap {
                // 2. Fetch the mandate
                fetchMandate(token)
            }
            .map { mandate ->
                // 2. If the subscription and the mandate exist, check the expiry date
                mandate.expiresAt?.isAfter(Instant.now()) ?: true
            }
    }

    private fun toDocument(input: MongoDocument): JsonObject {
        val output = JsonObject.mapFrom(input)
        output.put("_id", input.getMongoId())
        return output
    }

    /**
     * TODO: Update this implementation once Wallets generally adhere to the OpenPayments specification
     *
     * This method should register the Mandate with the external Wallet using an OAuth flow
     * A clientId/clientSecret specifically for charging invoices to this Mandate should then be returned,
     * allowing the WMP to periodically generate income from its subscribers.
     *
     * The clientId/clientSecret combination could be stored in a Mongo Collection as a result from this operation,
     * so it can be loaded to be used during the Invoice generation process (missing from this implementation).
     *
     * Finally, the URI referencing the Mandate is returned
     */
    private fun postMandate(
        token: Token,
        paymentPointer: PaymentPointer,
        input: OpenPaymentsMandateInput
    ): Single<URI> {
        // TODO: A mockup is created here...
        val mandate = OpenPaymentsMandate(
            id = URI("${paymentPointer.getWalletURI()}/mandates/${UUID.randomUUID()}"),
            account = paymentPointer.getWalletURI(),
            balance = input.amount,
            startAt = input.startAt,
            interval = input.interval,
            assetScale = input.assetScale,
            assetCode = input.assetCode,
            amount = input.amount,
            expiresAt = input.expiresAt
        )
        // And saved to Mongo for further reference. In a real implementation, this would not be necessary
        return mongoClient.rxSave(
            MONGO_MOCKUP_MANDATE_COLLECTION,
            toDocument(OpenPaymentsMandateWrapper(token.userId, mandate))
        ).ignoreElement()
            .toSingleDefault(mandate.id)
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class OpenPaymentsMandateWrapper(
    val userId: String,
    val mandate: OpenPaymentsMandate
) : MongoDocument {
    override fun getMongoId(): String {
        return encodeUrlId(userId)
    }
}
