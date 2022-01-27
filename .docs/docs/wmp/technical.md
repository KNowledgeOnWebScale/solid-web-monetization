## How to make this functional?

This Proof of Concept implementation can be used as a starting point for the development of a fully functional Web Monetization provider. Our implementation uses clearly defined interfaces for the various integration points (Open Payments interfacing, Solid Pod, ILP), making it easy to swap out the existing PoC implementation for a real implementation.

The following sections give an overview of the changes that need to be made to get this PoC to work for real-life use cases.

### Subscription Manager
The Subscription Manager is defined by the interface `SubscriptionManager`. This component is responsible for the creation and cancellation of subscriptions and the interfacing with the Open Payments mandates that are linked to the subscriptions. The Subscription Manager is the central component of the Web Monetization provider implementation.

The following public interface methods need to be implemented:

* `initSubscription`: Initialize and try to activate a new subscription
  1. Create metadata for the new subscription
  2. Register this WMP with the Solid Pod of the authenticated user
  3. Create a mandate on the Wallet of the authenticated user (using the Open Payments protocol)
* `getSubscription`: Retrieve subscription metadata (optionally include information on the validity of the subscription, see `validateSubscription`)
* `stopSubscription`: Cancels the subscription
  1. Remove any reference to this WMP from the Solid Pod of the authenticated user
  2. Delete the mandate on the Wallet of the authenticated user (using the Open Payments protocol)
  3. Delete the subscription metadata
* `fetchMandate`: Utility method to fetch the mandate associated with a subscription
* `validateSubscription` Validate a subscription by checking if the mandate still exists and has not been expired.

In addition, for the Web Monetization provider to be functional, the Subscription Manager should spawn one or multiple background processes that can act upon the mandates associated with the registered subscriptions, by creating charges using the Open Payments protocol (in order to generate funds for the Web Monetization provider operator). These processes are not implemented in this PoC, because at the time of writing there were no Wallet providers available in the ILP testnet that support the Open Payments specification.

**Checklist**

- [ ] Add a class implementing the `SubscriptionManager` interface. (The current PoC implementation `MongoSubscriptionManager` uses MongoDB to store subscription metadata and provides mockup interactions via Open Payments).
- [ ] Make sure to add a background process that tracks active subscriptions and charges the associated mandates to generate funds.
- [ ] Activate the new implementation by updating the argument for `IoCBindings.subscriptionManager` (this method should receive and return an instance of the new implementation class).

### ILP Stream Manager
The ILP Stream Manager is defined by the interface `ILPStreamManager`. This component is responsible for performing the micro-transactions backed by an Interledger (ILP) network.
The existing PoC implementation resolves the payments by performing HTTP requests to a test network (https://faucet.ilpv4.dev) using the ILP-over-HTTP protocol. This implementation should be replaced with a more advanced solution, backed by a production ILP network. For now, the interface `ILPStreamManager` only requires a single function to be implemented:

* `fun streamMoney(target: PaymentPointer): Flowable<ILPStreamUpdate>`: prepare a micro-transaction stream towards the provided payment pointer. The function must return a `Flowable` which can be used to activate and stop the stream, and allows listening for `ILPStreamUpdate` notifications. This class contains the amount and type of assets that were sent to the target, which is used by the WMP session API to communicate payment progress for a Web Monetization session to the clients (using a Websocket).

**Checklist**

- [ ] Add a class implementing the `ILPStreamManager` interface.
- [ ] Activate the new implementation by updating the argument for `IoCBindings.ilpStreamManager`.

### (Optional) Solid Pod Manager & AccessManager
The Solid Pod Manager is defined by the interface `SolidPodManager`. This component is responsible for interfacing with the Solid Pods of the WMP users. Likewise, Access Manager is defined by the interface `AccessManager`, which is a component that handles authentication and authorization based on Solid WebIDs.

The existing PoC implementations fulfill all the features required at this moment and are compatible with https://solidcommunity.net Solid pods.
Replace or extend upon these implementations to make the WMP compatible with other Solid pod providers or to expand the authorization layer (e.g. say you want to include an administrator role for managing the subscriptions and monitoring the sessions).
