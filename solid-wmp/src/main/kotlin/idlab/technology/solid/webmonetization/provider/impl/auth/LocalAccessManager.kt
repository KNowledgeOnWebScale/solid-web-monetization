package idlab.technology.solid.webmonetization.provider.impl.auth

import com.nimbusds.jose.JOSEException
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.jwk.source.JWKSource
import com.nimbusds.jose.jwk.source.RemoteJWKSet
import com.nimbusds.jose.proc.BadJOSEException
import com.nimbusds.jose.proc.JWSKeySelector
import com.nimbusds.jose.proc.JWSVerificationKeySelector
import com.nimbusds.jose.proc.SecurityContext
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier
import com.nimbusds.jwt.proc.DefaultJWTProcessor
import idlab.technology.solid.webmonetization.provider.AccessManager
import idlab.technology.solid.webmonetization.provider.SolidPodManager
import idlab.technology.solid.webmonetization.provider.Token
import idlab.technology.solid.webmonetization.provider.WMPConfig
import idlab.technology.solid.webmonetization.provider.utils.OpenIdConfig
import idlab.technology.solid.webmonetization.provider.utils.UnauthorizedException
import io.reactivex.Single
import io.reactivex.rxkotlin.subscribeBy
import io.vertx.core.http.HttpHeaders
import io.vertx.reactivex.core.http.HttpServerRequest
import io.vertx.reactivex.ext.web.client.WebClient
import java.net.URI
import java.net.URL
import java.text.ParseException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LocalAccessManager @Inject constructor(
    client: WebClient,
    config: WMPConfig,
    private val solid: SolidPodManager
) : AccessManager {
    private val jwtProcessor: ConfigurableJWTProcessor<SecurityContext> = DefaultJWTProcessor()
    private val solidCommunityOidc: OpenIdConfig

    init {

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
            onError = { throw RuntimeException("Can't contact solidcommunity.net IDP url") }
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
        if (!header.startsWith("Bearer ") && !header.startsWith("DPoP ")) return Single.error(UnauthorizedException("Invalid Authorization Bearer or DPoP header"))
        val tok =
            if (header.startsWith("Bearer ")) header.substring("Bearer ".length) else header.substring("DPoP ".length);

        try {
            // Verify
            val ctx: SecurityContext? = null;
            val claimsSet = jwtProcessor.process(tok, ctx)

            // Extra verify: webid domain == issuer domain
            val webIdDomain = URI(claimsSet.subject).host
            val issDomain = URL(claimsSet.issuer).host
            // If domain of webid is not inside domain of issuer
            if (!webIdDomain.endsWith(issDomain) && !webIdDomain.endsWith(".$issDomain")) {
                // Check if oidcIssuer property is set on the webid document.
                return solid.isWebIdAndIssuerCorrect(claimsSet.subject, claimsSet.issuer).flatMap { isOk ->
                    if (isOk) {
                        return@flatMap Single.just(Token(claimsSet.subject, tok))
                    } else {
                        return@flatMap Single.error(UnauthorizedException("Invalid JWT: token could not have been minted by issuer."))
                    }
                }
            } else {
                return Single.just(Token(claimsSet.subject, tok))
            }
        } catch (e: ParseException) {
            return Single.error(UnauthorizedException("Access token could not be parsed to a valid JWT"))
        } catch (e: BadJOSEException) {
            return Single.error(UnauthorizedException("Access token is rejected"))
        } catch (e: JOSEException) {
            return Single.error(UnauthorizedException("Internal processing error while processing access token"))
        }
    }

}
