package idlab.technology.solid.webmonetization.provider.utils

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.databind.deser.std.StdDeserializer
import com.fasterxml.jackson.databind.ser.std.StdSerializer
import java.net.URI

@JsonSerialize(using = PaymentPointerSer::class)
@JsonDeserialize(using = PaymentPointerDes::class)
data class PaymentPointer(
    val value: String
) {

    @JsonIgnore
    fun getWalletURI(): URI {
        return if (value.startsWith("\$")) URI("https://${value.substring(1)}") else throw IllegalArgumentException("Invalid payment pointer $value")
    }

}

class PaymentPointerSer : StdSerializer<PaymentPointer>(PaymentPointer::class.java) {

    override fun serialize(pp: PaymentPointer?, jsonGenerator: JsonGenerator?, provider: SerializerProvider?) {
        jsonGenerator?.writeString(pp?.value)
    }

}

class PaymentPointerDes : StdDeserializer<PaymentPointer>(PaymentPointer::class.java) {
    override fun deserialize(parser: JsonParser?, context: DeserializationContext?): PaymentPointer {
        return PaymentPointer(parser?.text.orEmpty())
    }

}
