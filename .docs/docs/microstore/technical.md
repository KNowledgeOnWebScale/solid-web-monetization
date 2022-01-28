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

Angular works with components. Each subpage is a component. Anything noteworthy will be explained per page.

#### About page

> Folder: `/src/app/about`

Nothing special happens on this page.

#### Paywall page

> Folder: `/src/app/paywall`

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

There is an `ngOnDestroy()` method, this lifecycle method gets called by the angular framework when the componet is destroyed. In our case, since it is a full page, this happens when the user routes to another page. The code here calls the [WMP service](@wmp-service) to close the current (if any) monetization stream.

#### Mixed content page

> Folder: `/src/app/mix`

### Other components

Other components are used in the HTML. A component has HTML, CSS and code (typescript) associated with it. You can use a component in HTML by using an HTML tag to refer to it.

#### Navigation component

> Folder: `/src/app/components/navigation`

#### Micropayment counter

> Folder: `/src/app/components/counter`


### Services

Services are singleton instances that are dependency injected into the components that list them as argument of their constructors.

#### Auth service

> Location: `/src/app/services/auth.service.ts`

#### Image service

> Location: `/src/app/services/image.service.ts`

#### Solid service

> Location: `/src/app/services/solid.service.ts`

#### WMP service

> Location: `/src/app/services/wmp.service.ts`

### App routing

All app routing paths can be fouind in `/src/app/app-routing.modules.ts`

## WebID Profile

!!! todo
    WebID is beging read, searching for the WMP provider quad. (explain this)