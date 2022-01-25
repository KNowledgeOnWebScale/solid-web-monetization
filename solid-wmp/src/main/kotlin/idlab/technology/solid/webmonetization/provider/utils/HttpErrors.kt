package idlab.technology.solid.webmonetization.provider.utils

import com.fasterxml.jackson.annotation.JsonInclude
import io.reactivex.exceptions.CompositeException
import io.reactivex.functions.Consumer
import io.vertx.core.http.HttpHeaders
import io.vertx.core.json.JsonObject
import io.vertx.reactivex.ext.web.RoutingContext
import mu.KotlinLogging
import org.slf4j.Logger

class HttpErrorHandler(val ctx: RoutingContext, val logger: Logger = KotlinLogging.logger { }) : Consumer<Throwable> {

    override fun accept(err: Throwable?) {
        when (err) {
            is HttpError -> err.writeResponse(ctx)
            is IllegalArgumentException -> {
                logger.debug("Encountered unhandled IllegalArgumentException, will be returned as HTTP 400", err)
                ctx.writeErrorJson(400, err.message)
            }
            is IllegalStateException -> {
                logger.debug("Encountered unhandled IllegalArgumentException, will be returned as HTTP 409", err)
                ctx.writeErrorJson(409, err.message)
            }
            is NoSuchElementException -> {
                logger.debug("Encountered unhandled NoSuchElementException, will be returned as HTTP 404", err)
                ctx.writeErrorJson(404, err.message)
            }
            is CompositeException -> ctx.writeErrorJson(
                statusCode(err.exceptions.first()),
                "${err.exceptions.size} exceptions occurred (see details for more information).",
                err.exceptions.map {
                    it.message ?: it::class.simpleName ?: ""
                })
            else -> {
                logger.error("Unexpected error for ${ctx.request().method().name()} ${ctx.request().uri()}", err)
                ctx.writeErrorJson(500, "An unexpected error occurred and has been logged!")
            }
        }
    }

    private fun statusCode(err: Throwable): Int {
        return when (err) {
            is HttpError -> err.statusCode
            is IllegalArgumentException -> 400
            is NoSuchElementException -> 404
            else -> 500
        }
    }
}

fun writeHttpError(ctx: RoutingContext): (Throwable) -> Unit {
    return HttpErrorHandler(ctx)::accept
}

fun writeHttpError(ctx: RoutingContext, logger: Logger): Consumer<Throwable> {
    return Consumer { HttpErrorHandler(ctx, logger).accept(it) }
}

open class HttpError @JvmOverloads constructor(val statusCode: Int, message: String? = null, cause: Throwable? = null) :
    RuntimeException(message, cause) {

    open fun writeResponse(ctx: RoutingContext) {
        ctx.writeErrorJson(statusCode, message)
    }

}

class BadRequestException @JvmOverloads constructor(message: String? = null, cause: Throwable? = null) :
    HttpError(400, message, cause)

class UnauthorizedException @JvmOverloads constructor(message: String? = null, cause: Throwable? = null) :
    HttpError(401, message, cause)

class AuthorizationException @JvmOverloads constructor(message: String? = null, cause: Throwable? = null) :
    HttpError(403, message, cause)

class NotFoundException @JvmOverloads constructor(message: String? = null, cause: Throwable? = null) :
    HttpError(404, message, cause)

class RedirectHttpError @JvmOverloads constructor(protected var redirectUri: String, message: String? = null) :
    HttpError(302, message) {
    override fun writeResponse(ctx: RoutingContext) {
        ctx.response().putHeader(HttpHeaders.LOCATION.toString(), redirectUri)
        super.writeResponse(ctx)
    }
}

class RedirectHttpStatusError @JvmOverloads constructor(
    var redirectUri: String,
    val status: Int,
    message: String? = null
) :
    HttpError(302, message) {
    override fun writeResponse(ctx: RoutingContext) {
        redirectUri += "?error=$status&message=$message";
        ctx.response().putHeader(HttpHeaders.LOCATION.toString(), redirectUri)
        super.writeResponse(ctx)
    }
}


class ServerError @JvmOverloads constructor(message: String? = null) : HttpError(500, message)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
private data class ErrorOutput(val status: Int, val message: String? = null, val details: List<String>? = null)

private fun RoutingContext.writeErrorJson(status: Int, message: String? = null, details: List<String>? = null) {
    val errorJson = JsonObject().put("error", JsonObject.mapFrom(ErrorOutput(status, message, details)))
    this.response().setStatusCode(status)
        .putHeader("Content-Type", "application/json")
        .end(errorJson.encode())
}
