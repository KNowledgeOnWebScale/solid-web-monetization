package idlab.technology.solid.webmonetization.provider.impl.auth

import com.nimbusds.jose.JOSEException
import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.ECDSASigner
import com.nimbusds.jose.jwk.Curve
import com.nimbusds.jose.jwk.ECKey
import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.KeyUse
import com.nimbusds.jose.jwk.gen.ECKeyGenerator
import com.nimbusds.jose.jwk.source.JWKSource
import com.nimbusds.jose.jwk.source.RemoteJWKSet
import com.nimbusds.jose.proc.BadJOSEException
import com.nimbusds.jose.proc.JWSKeySelector
import com.nimbusds.jose.proc.JWSVerificationKeySelector
import com.nimbusds.jose.proc.SecurityContext
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier
import com.nimbusds.jwt.proc.DefaultJWTProcessor
import idlab.technology.solid.webmonetization.provider.AccessManager
import idlab.technology.solid.webmonetization.provider.Token
import idlab.technology.solid.webmonetization.provider.WMPConfig
import idlab.technology.solid.webmonetization.provider.utils.OpenIdConfig
import idlab.technology.solid.webmonetization.provider.utils.UnauthorizedException
import io.reactivex.Single
import io.reactivex.rxkotlin.subscribeBy
import io.vertx.core.http.HttpHeaders
import io.vertx.core.http.HttpMethod
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.core.Vertx
import io.vertx.reactivex.core.http.HttpServerRequest
import io.vertx.reactivex.ext.web.client.WebClient
import java.net.URL
import java.text.ParseException
import java.time.Instant
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LocalAccessManager @Inject constructor(
    private val vertx: Vertx,
    private val client: WebClient,
    private val config: WMPConfig
) : AccessManager {
    private val jwtProcessor: ConfigurableJWTProcessor<SecurityContext> = DefaultJWTProcessor()
    private val jwks: JWKSet
    private val keyPair: ECKey;
    private val signer: ECDSASigner
    private val solidCommunityOidc: OpenIdConfig

    init {
        // Generate EC keypair
        fun generateKey(): ECKey {
            return ECKeyGenerator(Curve.P_256)
                .keyUse(KeyUse.SIGNATURE)
                .keyID(UUID.randomUUID().toString())
                .generate()
        }

        // Generate 3 keys
        val keys = listOf(generateKey(), generateKey(), generateKey());
        jwks = JWKSet(keys)

        // Use first for DPoP signing
        keyPair = keys.first();

        // Create signer
        signer = ECDSASigner(keyPair)

        // Configure AccessToken processor
        // Oidc config of solidcommunity.net
        solidCommunityOidc = OpenIdConfig(client, config.idpUriSolidCommunity)

        // Set expected algorithm
        solidCommunityOidc.getJwksUri().subscribeBy(
            onSuccess = {
                val keySource: JWKSource<SecurityContext> = RemoteJWKSet(URL(it))
                val expectedJWSAlg: JWSAlgorithm = JWSAlgorithm.RS256 // TODO: for now hardcoded to solidcommunity.net
                val keySelector: JWSKeySelector<SecurityContext> = JWSVerificationKeySelector(expectedJWSAlg, keySource)
                jwtProcessor.jwsKeySelector = keySelector
            },
            onError = { throw RuntimeException("Can't contact Solidcommunity.net IDP url") }
        )

        // Set required claims
        jwtProcessor.jwtClaimsSetVerifier = DefaultJWTClaimsVerifier(
            JWTClaimsSet.Builder()
                .issuer("https://solidcommunity.net")
                .audience("solid")
                .build(),
            HashSet(listOf("sub", "iat", "exp", "jti"))
        )
    }

    override fun getToken(request: HttpServerRequest): Single<Token> {
        val header = request.getHeader(HttpHeaders.AUTHORIZATION)
            ?: return Single.error(UnauthorizedException("Authorization header is missing"))
        if (!header.startsWith("Bearer ") && !header.startsWith("DPoP ") ) return Single.error(UnauthorizedException("Invalid Authorization Bearer or DPoP header"))
        val tok = if (header.startsWith("Bearer ")) header.substring("Bearer ".length) else header.substring("DPoP ".length);

        try {
            // Verify
            val ctx: SecurityContext? = null;
            val claimsSet = jwtProcessor.process(tok, ctx)

            // Parse
            val webId = claimsSet.subject

            // Return Token instance
            return Single.just(Token(webId, tok))
        } catch (e: ParseException) {
            return Single.error(UnauthorizedException("Access token could not be parsed to a valid JWT"))
        } catch (e: BadJOSEException) {
            return Single.error(UnauthorizedException("Access token is rejected"))
        } catch (e: JOSEException) {
            return Single.error(UnauthorizedException("Internal processing error while processing access token"))
        }
    }

    override fun generateDpopProof(method: HttpMethod, endpoint: String): String {
        // Prepare DPoP claims
        val claims = JWTClaimsSet.Builder()
            .jwtID(UUID.randomUUID().toString())
            .issueTime(Date.from(Instant.now()))
            .claim("htm", method.name())
            .claim("htu", endpoint)
            .build()

        // Create JWT
        val signedDpop = SignedJWT(
            JWSHeader.Builder(JWSAlgorithm.ES256).keyID(keyPair.keyID).type(JOSEObjectType("dpop+jwt"))
                .jwk(keyPair.toPublicJWK()).build(),
            claims
        )

        // Compute EC signature
        signedDpop.sign(signer)

        // Serialise DPoP to compact form
        return signedDpop.serialize()
    }

    override fun getPublicJwks(): JsonObject {
        return JsonObject.mapFrom(jwks.toJSONObject(true))
    }
}
