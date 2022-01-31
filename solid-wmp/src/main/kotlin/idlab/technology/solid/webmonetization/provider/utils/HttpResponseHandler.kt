package idlab.technology.solid.webmonetization.provider.utils

import io.vertx.core.http.HttpHeaders
import io.vertx.core.json.JsonArray
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.ext.web.RoutingContext

/**
 * Writes any object that can be serialized to JSON to the HTTP Response as the Response body.
 * The Response Content-Type is set to 'application/json'.
 */
fun writeHttpResponse(ctx: RoutingContext): (Any) -> Unit {
    return { ctx.json(if (it is List<*>) JsonArray(it) else JsonObject.mapFrom(it)) }
}

fun writeLDHttpResponse(ctx: RoutingContext, context: JsonObject): (Any) -> Unit {
    return {
        val result = context.copy()
        if (it is List<*>) {
            result.put("@graph", JsonArray(it))
        } else {
            result.mergeIn(JsonObject.mapFrom(it))
        }
        ctx.response()
            .putHeader(HttpHeaders.CONTENT_TYPE.toString(), "application/ld+json")
            .end(result.encode())
    }
}
