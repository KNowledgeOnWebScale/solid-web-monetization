package idlab.technology.solid.webmonetization.provider.utils

import io.reactivex.*
import mu.KLogger
import org.reactivestreams.Publisher


/**
 * Shorthand for completable.andThen(Completable.defer{..})
 */
fun Completable.flatMap(completableSupplier: () -> CompletableSource): Completable {
    return this.andThen(Completable.defer(completableSupplier))
}

/**
 * Shorthand for completable.andThen(Single.defer{..})
 */
fun <T> Completable.flatMapSingle(singleSupplier: () -> SingleSource<out T>): Single<T> {
    return this.andThen(Single.defer(singleSupplier))
}

/**
 * Shorthand for completable.andThen(Maybe.defer{..})
 */
fun <T> Completable.flatMapMaybe(maybeSupplier: () -> MaybeSource<out T>): Maybe<T> {
    return this.andThen(Maybe.defer(maybeSupplier))
}


/**
 * Shorthand for completable.andThen(Flowable.defer{..})
 */
fun <T> Completable.flatMapPublisher(publisherSupplier: () -> Publisher<out T>): Flowable<T> {
    return this.andThen(Flowable.defer(publisherSupplier))
}

/**
 * toSingle variant that accepts a nullable default
 */
fun <T> Maybe<T>.toSingleNullSafe(nullableDefault: T?): Single<T> {
    return if (nullableDefault == null) this.toSingle() else this.toSingle(nullableDefault)
}

/**
 * Utility variant of Single.flatMap: only applies the mapper function if the supplied boolean == true
 */
fun <T> Single<T>.flatMapIf(condition: Boolean, mapper: (T) -> SingleSource<out T>): Single<T> {
    return this.flatMapIf({ condition }, mapper)
}

/**
 * Utility variant of Single.flatMap: only applies the mapper function if the supplied condition holds true
 */
fun <T> Single<T>.flatMapIf(condition: (T) -> Boolean, mapper: (T) -> SingleSource<out T>): Single<T> {
    return this.flatMap {
        if (condition.invoke(it)) {
            mapper.invoke(it)
        } else {
            Single.just(it)
        }
    }
}

fun <T> Flowable<T>.toSet(): Single<Set<T>> {
    return this.reduce(emptySet()) { r1, r2 -> r1.plus(r2) }
}

fun Completable.onErrorLogAndComplete(logger: KLogger): Completable {
    return this.onErrorComplete {
        logger.warn(it) { "Ignored error for Completable!" }
        true
    }
}
