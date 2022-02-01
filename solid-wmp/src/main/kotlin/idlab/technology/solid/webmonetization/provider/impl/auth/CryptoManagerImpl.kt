package idlab.technology.solid.webmonetization.provider.impl.auth

import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.ECDSASigner
import com.nimbusds.jose.jwk.Curve
import com.nimbusds.jose.jwk.ECKey
import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.KeyUse
import com.nimbusds.jose.jwk.gen.ECKeyGenerator
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import idlab.technology.solid.webmonetization.provider.CryptoManager
import io.vertx.core.http.HttpMethod
import io.vertx.core.json.JsonObject
import java.time.Instant
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CryptoManagerImpl @Inject constructor(

) : CryptoManager {
    private val jwks: JWKSet
    private val keyPair: ECKey;
    private val signer: ECDSASigner

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