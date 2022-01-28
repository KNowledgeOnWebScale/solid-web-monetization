# Technical

This information is meant for developers looking at the code of the Microstore application.

## Stack

### Framework

The application is written in [Angular 13.x.x](https://angular.io) and thus in TypeScript. It is written as a browser application.

### Package manager

The [yarn package manager](https://yarnpkg.com/) was used. It behaves very similar to npm but is a bit faster and more modern in use.

To install all libraries and build the code: run `yarn` from the project folder `/solid-microstore`.

To run the code in a development server: execute `yarn start` from the project folder `/solid-microstore`.

### Libraries

The noteworthy libraries used and why are listed below:

library |  reason | npm link
--------|---------|----------
n3 | Implementation of the RDF.js low-level specification that lets you handle RDF. | https://www.npmjs.com/package/n3
@inrupt/solid-client-authn-browser |  Authenticate web apps (in the browser) with Solid identity servers. | https://www.npmjs.com/package/@inrupt/solid-client-authn-browser
@inrupt/vocab-common-rdf |  Bundle of common RDF vocabularies. | https://www.npmjs.com/package/@inrupt/vocab-common-rdf
sockjs-client | Counterpart of SockJS used on the server. it provides a WebSocket-like object. | https://www.npmjs.com/package/sockjs-client
solid-wmp-client | Handles communication with a server component implementing the proposed [WMP specification](/specification) | https://www.npmjs.com/package/solid-wmp-client
web-monetization-polyfill | Polyfill the [Web Monetization JavaScript API](https://webmonetization.org/docs/api) on document.monetization, required until it is provided by browsers | https://www.npmjs.com/package/web-monetization-polyfill

## Code notes

### Pages

Angular works with components. Each subpage is a component. 

Important for this demonstrator is that where possible, the standard [Web Monetization Javascript API](https://webmonetization.org/docs/api) was used. Typically this amounts to registering event listeners to the `document.monetization` object and reacting on the fired events.

Anything else noteworthy will be explained per page.

#### About page

!!! warning ""
    :material-folder-outline: `/src/app/about`

Nothing special happens on this page.

#### Paywall page

!!! warning ""
    :material-folder-outline: `/src/app/paywall`

##### constructor(...)

On creation of this page, eventlisteners are added for all four [MonetizationEvents](https://webmonetization.org/docs/api/#browser-events), to not miss any events being fired early on. The listeners manage the display of the paywall overlay.

```typescript
constructor(...) {
    // Setup listeners
    document.monetization?.addEventListener('monetizationstart', evt => this.onStart(evt));
    document.monetization?.addEventListener('monetizationprogress', evt => this.onProgress(evt));
    document.monetization?.addEventListener('monetizationstop', evt => this.onStop(evt));
    document.monetization?.addEventListener('monetizationpending', evt => this.onPending(evt));
}
```

##### unlock()

The page starts with a locked paywall overlay that can be unlocked only when the user is logged in. For that the `loggedIn` property of the [Auth service](#auth-service) is checked. If that unlock button is clicked, the `unlock()` method is called.

This will first call the [WMP service](@wmp-service) to check whether monetization is supported. If so, the [Solid service](#solid-service) is called to fetch the stored WMP form the user's [WebID](@webid-profile). The URL of the WMP is then passed on to the [WMP service](@wmp-service) to setup the payment.

##### ngOnDestroy()

There is an `ngOnDestroy()` method, this lifecycle hook gets called by the angular framework when the componet is destroyed. In our case, since it is a full page, this happens when the user routes to another page. The code here calls the [WMP service](#wmp-service) to close the current (if any) monetization stream.

#### Mixed content page

!!! warning ""
    :material-folder-outline: `/src/app/mix`

##### constructor(...)

On creation of this page, eventlisteners are added for two [MonetizationEvents](https://webmonetization.org/docs/api/#browser-events), to not miss any events being fired early on. The listeners manage the display of the LOCKED labels.

```typescript
constructor(...) {
// Setup listeners
      document.monetization?.addEventListener('monetizationstart', _ => this.locked = false);
      document.monetization?.addEventListener('monetizationstop', _ => this.locked = true);
}
```

##### ngOnInit()

This lifecycle hook is called upon initialization of the page by the angular framework. Here two things happen:

1. The [Image service](#image-service) is being called to generate 100 random images.
2. We subscribe on the `statusChanged$` [Subject](https://rxjs.dev/guide/subject) property of the [Auth service](@auth-service) to do the following once the user is logged in:

    * Request the [Solid service](#solid-service) to fetch the WMP URL from the [WebID Profile](#webid-profile) document.
    * Call the [WMP service](#wmp-service) to set up the payment using that URL.

##### ngOnDestroy()

There is an `ngOnDestroy()` method, this lifecycle hook gets called by the angular framework when the componet is destroyed. In our case, since it is a full page, this happens when the user routes to another page. The code here calls the [WMP service](#wmp-service) to close the current (if any) monetization stream.

### Other components

The leftover components are used as custom html elements in the HTML. A component has HTML, CSS and code (typescript) associated with it. You can use a component in HTML by using an HTML tag to refer to it.

#### Navigation component

!!! warning ""
    :material-folder-outline: `/src/app/components/navigation`

This component just encapsulates the navigation bar on top. It provides a login butten and offloads the `login()` and `logout()` actions to the [Auth service](#auth-service).

#### Micropayment counter

!!! warning ""
    :material-folder-outline: `/src/app/components/counter`

This component encapsulates the logic to view the progress and status of the micropayments.

##### constructor()

On creation of this component, eventlisteners are added for all four [MonetizationEvents](https://webmonetization.org/docs/api/#browser-events), to not miss any events being fired early on. The listeners manage the update of the counter view.

```typescript
constructor() {
    // Setup listeners
    document.monetization?.addEventListener('monetizationstart', e => this.onStart(e));
    document.monetization?.addEventListener('monetizationprogress', e => this.onProgress(e));
    document.monetization?.addEventListener('monetizationstop', e => this.onStop(e));
    document.monetization?.addEventListener('monetizationpending', e => this.onPending(e));
}
```

The [code itself](https://github.com/KNowledgeOnWebScale/solid-web-monetization/tree/master/solid-microstore/src/app/components/counter) is well enough documented to figure out how this counter works.

### Services

Services are singleton instances that are dependency injected into the components that list them as argument of their constructors.

#### Auth service

!!! warning ""
    :material-file-outline: `/src/app/services/auth.service.ts`

This service is mainly a wrapper around the [@inrupt/solid-client-authn-browser](https://www.npmjs.com/package/@inrupt/solid-client-authn-browser) library. 

##### handleIncomingCallback()

This method consolidates two callback methods from the auth library that should be called when the application gets called on its callback URI. This method gets called from inside the `app.component.ts` `ngOnInit()` call, which is one of the first scripts to get executed.

##### login()

This calls the auth library's `login()` method but with a fixed value of `http://solidcommunity.net`.

##### fetch property

This returns the custom `fetch()` function of the auth library. Their security architecture does not allow for the access token to be exposed, that's why a custom fetch function is exposed that fills in the required [`Authorization`](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-dpop-04#section-7.1) and [`DPoP`](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-dpop-04#section-4.1) headers for you.

#### Image service

!!! warning ""
    :material-file-outline: `/src/app/services/image.service.ts`

This is a simple service that is able to consistently generate multiple generated images with at random picked colors, interleaved with some _premium_ images.

#### Solid service

!!! warning ""
    :material-file-outline: `/src/app/services/solid.service.ts`

This service contains the code to read from the WebID document on the solid pod of the user. It mainly uses the [n3 library](#libraries) to read the solid [WebID profile](#webid-profile) and fetch the proper quads/triples.

The [code](https://github.com/KNowledgeOnWebScale/solid-web-monetization/blob/master/solid-microstore/src/app/services/solid.service.ts) itself is documented.

#### WMP service

!!! warning ""
    :material-file-outline: `/src/app/services/wmp.service.ts`

This service encapsulates the [solid-wmp-client](https://www.npmjs.com/package/solid-wmp-client) library.

##### constructor(...)

The constructor instantiates a WmpClient instance, assigns a variable `wmHandler` to the MonetizationHandler helper object and assigns a variable `fetch` to the custom fetch function from the [Auth service](#auth-service).

```typescript
constructor(auth: AuthService) {
    this.wmp = new WmpClient();
    this.wmHandler = this.wmp.getMonetizationHandler();    
    this.fetch = auth.fetch;
}
```

##### setupWMPayment(...)

This method instructs the wmp client instance to setup the payment from the WMP on the given `wmpUrl` using the given `fetch` function.

##### closeMonetizationStream()

This methode will instruct the wmp client instance to close any open payment stream.

### App routing

All app routing paths can be found in `/src/app/app-routing.modules.ts`

## WebID Profile

he WebID profile is stored in RDF. That means that data read from that profile should be queried as RDF. To query a WebID Profile document for a WMP url, this tuple is being searched.

**`https://<my-username].solidcommunity.net/profile/card#me`**
```
@prefix : <#>.
...
@prefix ns0: <https://webmonetization.org/ns#>.

...

#me 
    ...
    ns0:hasProvider :me-webmonetization-provider.

:me-webmonetization-provider
    a ns0:Provider;
    ns0:apiUrl "http://wmp.localhost".

```

The actual query was performed by the [solid-wmp-client](https://github.com/KNowledgeOnWebScale/solid-wmp-client) library.

--8<-- "includes/abbreviations.md"