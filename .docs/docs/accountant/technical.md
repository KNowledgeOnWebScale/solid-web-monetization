# Technical

This information is meant for developers looking at the code of the Accountant application.

## Stack

### Framework

The application is written in [Angular 13.x.x](https://angular.io) and thus in [TypeScript](https://www.typescriptlang.org/). It is written as a browser application.

### Package manager

The [yarn package manager](https://yarnpkg.com/) was used. It behaves very similar to [npm](https://docs.npmjs.com/cli/v8) but is a bit faster and more modern in use.

To install all libraries and build the code: run `yarn` from the project folder `/solid-accountant`.

To run the code in a development server: execute `yarn start` from the project folder `/solid-accountant`.

### Libraries

The noteworthy libraries used and the reason for doing so are listed below:

library |  reason | npm link
--------|---------|----------
n3 | Implementation of the RDF.js low-level specification that lets you handle RDF. | https://www.npmjs.com/package/n3
@inrupt/solid-client-authn-browser |  Authenticate web apps (in the browser) with Solid identity servers. | https://www.npmjs.com/package/@inrupt/solid-client-authn-browser
@inrupt/vocab-common-rdf |  Bundle of common RDF vocabularies. | https://www.npmjs.com/package/@inrupt/vocab-common-rdf

## Code notes

### Pages

Angular works with components. Each subpage is a component, as such the following folders contain the component for those subpages:

  * `/src/app/home`: Home page
  * `/src/app/pp`: Payment pointers page
  * `/src/app/about`: About page
  * `/src/app/auth`: Login page

Nothing special happens in the code for these pages. The code and HTML should speak for itself.

### Other components

The leftover components are used as custom HTML Elements in the HTML. A component has HTML, CSS and code (typescript) associated with it. You can use a component in HTML by using an HTML tag to refer to it.

```html
<!-- Example tag -->
<app-login-btn [provider]="p"></app-login-btn>
```

#### Login button

!!! warning ""
    :material-folder-outline: `/src/app/components/login-btn`

This component is used for the login boxes on the login page with a logo of the IDP.

### Services

Services are singleton instances that are dependency injected into the components that list them as arguments of their constructor.

#### SolidService

!!! warning ""
    :material-file-outline: `/src/app/services/solid.service.ts`

This service contains the code to read from, parse and write to the WebID document on the solid pod of the user. It mainly uses the [n3 library](#libraries) to read/write the solid WebID profile.

The [code](https://github.com/KNowledgeOnWebScale/solid-web-monetization/blob/master/solid-accountant/src/app/services/solid.service.ts) itself is documented.

### App routing

All app routing paths can be fouind in `/src/app/app-routing.modules.ts`

## WebID Profile

The WebID profile is stored in RDF. That means that data written to that profile should also be formatted in RDF. To store our PaymentPointers, the following RDF triples are written into that WebID profile:

**`https://<my-username].solidcommunity.net/profile/card#me`**
```
@prefix : <#>.
...
@prefix n: <https://paymentpointers.org/ns#>.

...

#me 
    ...
    n:hasPaymentPointer :me-paymentpointer-1.

:me-paymentpointer-1 
    a n:InterledgerPaymentPointer;
    n:paymentPointerValue "$my.paymentpointer.value".

```

This was done by means of a [SPARQL update](https://www.w3.org/TR/sparql11-update/) PATCH request. (See [here...](https://github.com/solid/solid-spec/blob/master/api-rest.md#alternative-using-sparql-1)).

--8<-- "includes/abbreviations.md"