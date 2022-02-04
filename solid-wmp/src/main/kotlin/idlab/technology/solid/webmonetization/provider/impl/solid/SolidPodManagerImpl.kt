package idlab.technology.solid.webmonetization.provider.impl.solid

import idlab.technology.solid.webmonetization.provider.CryptoManager
import idlab.technology.solid.webmonetization.provider.SolidPodManager
import idlab.technology.solid.webmonetization.provider.Token
import idlab.technology.solid.webmonetization.provider.WMPConfig
import io.reactivex.Completable
import io.reactivex.Single
import io.vertx.core.http.HttpHeaders
import io.vertx.core.http.HttpMethod
import io.vertx.reactivex.core.Vertx
import io.vertx.reactivex.core.buffer.Buffer
import io.vertx.reactivex.ext.web.client.WebClient
import mu.KotlinLogging
import org.apache.jena.query.QueryExecutionFactory
import org.apache.jena.rdf.model.*
import org.apache.jena.vocabulary.RDF
import java.io.ByteArrayOutputStream
import javax.inject.Inject
import javax.inject.Singleton

private const val ME = "#me"
private const val WMP_LOCAL_REF = "$ME-webmonetization-provider"
private const val OIDCissuer = "http://www.w3.org/ns/solid/terms#oidcIssuer"

private val PP_QUERY = """
        SELECT ?entity
        WHERE {
            ?entity a <${PaymentPointers.InterledgerPaymentPointer}> .
        }
    """.trimIndent()

private val OIDC_ISSIER_QUERY = """
        SELECT ?webid ?iss
        WHERE {
            ?webid <${OIDCissuer}> ?iss.
        }
    """.trimIndent()

@Singleton
class SolidPodManagerImpl @Inject constructor(
    private val vertx: Vertx,
    private val webClient: WebClient,
    private val config: WMPConfig,
    private val cryptoManager: CryptoManager
) :
    SolidPodManager {

    private val logger = KotlinLogging.logger { }

    override fun isWebIdAndIssuerCorrect(webid: String, issuer: String): Single<Boolean> {
        return vertx.rxExecuteBlocking<Boolean> { promise ->
            val model = ModelFactory.createDefaultModel()
            model.read(webid)
            val queryExec = QueryExecutionFactory.create(OIDC_ISSIER_QUERY, model)
            try {
                val results = queryExec.execSelect()
                while (results.hasNext()) {
                    val sol = results.nextSolution();
                    val qWebid = sol.getResource("webid");
                    val qIss = sol.getLiteral("iss");
                    val valid = qWebid.uri.equals(webid, true) && qIss.string.equals(issuer, true);
                    promise.complete(valid)
                    return@rxExecuteBlocking
                }
                promise.complete(false)
            } catch (ex: Throwable) {
                promise.fail(ex)
            } finally {
                queryExec.close()
            }
        }
            .toSingle()
    }


    override fun isLinkedPaymentPointer(token: Token, paymentPointer: String): Single<Boolean> {
        return vertx.rxExecuteBlocking<Boolean> { promise ->
            val model = ModelFactory.createDefaultModel()
            model.read(token.userId)
            val queryExec = QueryExecutionFactory.create(PP_QUERY, model)
            try {
                val results = queryExec.execSelect()
                while (results.hasNext()) {
                    val ppResource = results.nextSolution().get("entity") as Resource
                    if (ppResource.hasProperty(PaymentPointers.paymentPointerValue) && ppResource.getProperty(
                            PaymentPointers.paymentPointerValue
                        ).string == paymentPointer
                    ) {
                        promise.complete(true)
                        return@rxExecuteBlocking
                    }
                }
                promise.complete(false)
            } catch (ex: Throwable) {
                promise.fail(ex)
            } finally {
                queryExec.close()
            }
        }
            .toSingle()
    }

    override fun registerWMP(token: Token): Completable {
        return sparqlPatch(token = token, endpoint = token.userId, addModel = createWMPAssignment())
    }

    override fun unregisterWMP(token: Token): Completable {
        return sparqlPatch(token = token, endpoint = token.userId, deleteModel = createWMPAssignment())
    }

    private fun createWMPAssignment(): Model {
        val model = ModelFactory.createDefaultModel()
        model.createResource(WMP_LOCAL_REF)
            .addProperty(RDF.type, WebMonetization.Provider)
            .addProperty(WebMonetization.apiUrl, config.baseURI)

        model.createResource(ME)
            .addProperty(WebMonetization.hasProvider, model.getResource(WMP_LOCAL_REF))
        return model
    }

    private fun sparqlPatch(
        token: Token,
        endpoint: String,
        addModel: Model? = null,
        deleteModel: Model? = null
    ): Completable {
        val body = listOfNotNull(
            addModel?.asN3String()?.let { "INSERT DATA { $it }" },
            deleteModel?.asN3String()?.let { "DELETE DATA { $it }" }
        ).joinToString("\n")
        val dpop = cryptoManager.generateDpopProof(HttpMethod.PATCH, onlyKeepHostAndPathPartOfUrl(endpoint))
        logger.debug { "Authorization: DPoP ${token.podAccessToken}" }
        logger.debug { "DPoP: $dpop" }
        return webClient.patchAbs(endpoint)
            .putHeader(HttpHeaders.CONTENT_TYPE.toString(), "application/sparql-update")
            .putHeader(HttpHeaders.AUTHORIZATION.toString(), "DPoP ${token.podAccessToken}")
            .putHeader("DPoP", dpop)
            .rxSendBuffer(Buffer.buffer(body))
            .flatMapCompletable { resp ->
                if (resp.statusCode() in 200..399) {
                    Completable.complete()
                } else {
                    Completable.error(RuntimeException("Error while applying SPARQL patch! ${resp.statusCode()} ${resp.statusMessage()} (${resp.bodyAsString()})"))
                }
            }
    }
}

private fun Model.asN3String(): String {
    return ByteArrayOutputStream().use { os ->
        this.write(os, "N3")
        os.toString("UTF-8")
    }
}

private fun onlyKeepHostAndPathPartOfUrl(url: String): String {
    return url.replace(Regex("(\\?.*|#.*)"), "")
}

object PaymentPointers {

    private val m = ModelFactory.createDefaultModel()
    val NS = "https://paymentpointers.org/ns#"
    val NAMESPACE = m.createResource(NS)
    val InterledgerPaymentPointer = m.createResource("${NS}InterledgerPaymentPointer")
    val hasPaymentPointer = m.createProperty("${NS}hasPaymentPointer")
    val paymentPointerValue = m.createProperty("${NS}paymentPointerValue")
}

object WebMonetization {
    private val m = ModelFactory.createDefaultModel()
    val NS = "https://webmonetization.org/ns#"
    val NAMESPACE = m.createResource(NS)
    val Provider = m.createResource("${NS}Provider")
    val hasProvider = m.createProperty("${NS}hasProvider")
    val apiUrl = m.createProperty("${NS}apiUrl")
}
