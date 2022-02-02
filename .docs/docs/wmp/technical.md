# Solid Web Monetization Provider - Technical

## Stack

### Framework
The WMP Proof of Concept is written in [Kotlin 1.6.10](https://kotlinlang.org) on top of JDK 16. The [Vert.x](https://vertx.io/) toolkit is used as a Web/Micro-service framework (Vert.x can be compared to Node.js). 

### Project setup
[Maven](https://maven.apache.org) was used for describing the project dependencies, managing builds and generating the Docker image.

To install all dependencies and compile the project: run `mvn compile` from the project folder `/solid-wmp`.
To generate a Docker image:

1. Override the details for the `to` image repository of the [Jib plugin](https://github.com/GoogleContainerTools/jib/tree/master/jib-maven-plugin) in the file `/solid-wmp/pom.xml`
2. Run `mvn package` from the project folder `/solid-wmp`.

### Libraries
Next to the framework related dependencies, the following additional libraries were used:

library |  reason | project link
--------|---------|----------
Feather | Dependency injection framework, makes it easy to extend or replace specific implementation modules | https://github.com/zsoltherpai/feather
Apache Jena | Framework for building Semantic Web and Linked Data applications | https://jena.apache.org

## Extending the Proof of Concept

This Proof of Concept implementation can be used as a starting point for the development of a fully functional [Solid Web Monetization Provider](/solid-web-monetization/spec.html). Our implementation uses clearly defined interfaces for the various integration points ([Open Payments interfacing](https://openpayments.dev/), [Solid Pod](https://solidproject.org/users/get-a-pod), [ILP](https://interledger.org/rfcs/0003-interledger-protocol/)), making it easy to swap out the existing PoC implementation for a real implementation.

The following sections give an overview of the changes required to get this PoC working for real-life use cases.

### Subscription Manager
The Subscription Manager is defined by the interface `SubscriptionManager`. This component is responsible for the creation and cancellation of subscriptions and the interfacing with the [Open Payments Mandates](https://docs.openpayments.dev/mandates) that are linked to the subscriptions. The Subscription Manager is the central component of the Web Monetization provider implementation.

The following public interface methods need to be implemented:

* `initSubscription`: Initialize and try to activate a new subscription
    1. Create metadata for the new subscription
    2. Register this WMP with the Solid Pod of the authenticated user
    3. Create a [Mandate](https://docs.openpayments.dev/mandates) on the Wallet of the authenticated user (using the [Open Payments protocol](https://docs.openpayments.dev/api))
* `getSubscription`: Retrieve subscription metadata (optionally include information on the validity of the subscription, see `validateSubscription`)
* `stopSubscription`: Cancels the subscription
    1. Remove any reference to this WMP from the Solid Pod of the authenticated user
    2. Delete the [Mandate](https://docs.openpayments.dev/mandates) on the Wallet of the authenticated user (using the [Open Payments protocol](https://docs.openpayments.dev/api))
    3. Delete the subscription metadata
* `fetchMandate`: Utility method to fetch the [Mandate](https://docs.openpayments.dev/mandates) associated with a subscription
* `validateSubscription` Validate a subscription by checking if the [Mandate](https://docs.openpayments.dev/mandates) still exists and has not been expired.

In addition, for the Web Monetization Provider to be functional, the Subscription Manager should spawn one or multiple background processes that can act upon the [Mandates](https://docs.openpayments.dev/mandates) associated with the registered subscriptions, by creating [Charges](https://docs.openpayments.dev/charges) using the [Open Payments protocol](https://docs.openpayments.dev/api) (in order to generate funds for the Web Monetization provider operator). 

These processes are not implemented in this PoC, because at the time of writing there were no Wallet providers available in the ILP testnet that support the [Open Payments specification](https://docs.openpayments.dev/api).

**Checklist**

- [x] Add a class implementing the `SubscriptionManager` interface.  
      *(The current PoC implementation `MongoSubscriptionManager` uses [MongoDB](https://www.mongodb.com/) to store subscription metadata and provides mockup interactions via Open Payments).*
- [x] Make sure to add a background process that tracks active subscriptions and [Charges](https://docs.openpayments.dev/charges) the associated [Mandates](https://docs.openpayments.dev/mandates) to generate funds.
- [x] Activate the new implementation by updating the argument for `IoCBindings.subscriptionManager`.  
      *(This method should receive and return an instance of the new implementation class).*

### ILP Stream Manager
The ILP Stream Manager is defined by the interface `ILPStreamManager`. This component is responsible for performing the micro-transactions backed by an [Interledger](https://interledger.org/) (ILP) network.

The existing PoC implementation resolves the payments by performing HTTP requests to a test network (https://faucet.ilpv4.dev) using the [ILP-over-HTTP protocol](https://interledger.org/rfcs/0035-ilp-over-http/). This implementation should be replaced with a more advanced solution, backed by a production ILP network. 

For now, the interface `ILPStreamManager` only requires a single function to be implemented:

* `fun streamMoney(target: PaymentPointer): Flowable<ILPStreamUpdate>`: prepare a micro-transaction stream towards the provided [payment pointer](https://paymentpointers.org).  
  The function must return a `Flowable` which can be used to activate and stop the stream, and allows listening for `ILPStreamUpdate` notifications. This class contains the amount and type of assets that were sent to the target, which is used by the [WMP session API](/solid-web-monetization/spec.html#sessions) to communicate payment progress for a Web Monetization session to the clients (using a Websocket).

**Checklist**

- [x] Add a class implementing the `ILPStreamManager` interface.
- [x] Activate the new implementation by updating the argument for `IoCBindings.ilpStreamManager`.

### Solid Pod Manager & AccessManager (optional) 
The Solid Pod Manager is defined by the interface `SolidPodManager`. This component is responsible for interfacing with the Solid Pods of the WMP users. Likewise, Access Manager is defined by the interface `AccessManager`, which is a component that handles authentication and authorization based on Solid WebIDs.

The existing PoC implementations fulfill all the features required at this moment and are compatible with https://solidcommunity.net Solid pods.
Replace or extend upon these implementations to make the WMP compatible with other Solid pod providers or to expand the authorization layer (e.g. say you want to include an administrator role for managing the subscriptions and monitoring the sessions).


--8<-- "includes/abbreviations.md"