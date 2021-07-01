<!-- The text in these bracketed sections will not appear once you publish the post. -->

<!-- Be sure to update all text in the {brackets} that appear in the title of your post. -->

<!-- As a Grant for the Web grantee it is important that you update the community and the program on the progress of your work. This is a chance to brag a little, name where you might have struggled and get feedback from the Web Monetization Community. -->


## Image (optional)

<!-- Share a project screenshot, a whiteboard doodle, or a photo of your team hard at work. -->


## Project Update

<!-- Provide a short summary of how your project is going. Feel free to highlight a big win, a struggle you had or generally update us on where you are on your timeline. If this is your final report, provide a summary of how your project went during the funded period. -->
Our first focus on the project was having a (web) application to assign payment pointers to a Solid WebID. This is a requirement to get started on the rest of the project. It also gave us a chance to dig in to Solid development and the use of different libraries. That web application is now ready, and allows us to log in to a Solid identity provider of your choice and then add one or more payment pointers to that WebID.

## Progress on objectives

<!-- Referencing your original proposal, please update on each objective.
It's OK if some of them have evolved - simply share how and why that happened. If you have links to any outputs, either final or in-progress (e.g. mock ups, prototypes) share them here. This could include blogs, documentation, GitHub repos, tools audio-video content, etc. -->
One of our three original objectives was to be able to configure a link between a user's Solid identity and his/her wallet. With the before mentioned application that allows adding payment pointers, we feel that this objective is near to completion. Of course some minor tweaks might be done in the future, but the bulk of that work is done. There is also an auto deployment available of that application via our CI/CD pipeline, which is hosted at https://knowledgeonwebscale.github.io/solid-web-monetization/.  
Originally we were planning on using the [@inrupt/solid-ui-react](https://www.npmjs.com/package/@inrupt/solid-ui-react) library to leverage most of the work, but we have since moved from React to Angular and used the lower level [@inrupt/solid-client-authn-browser](https://www.npmjs.com/package/@inrupt/solid-client-authn-browser) library to leverage the solid auth work. We chose [N3](https://www.npmjs.com/package/n3) for parsing and writing the RDF data in the Solid WebID.

A second objective involves tying into the Solid authentication library to trigger a check for payment pointers in the user's Solid Identity. This objective has not been started yet. We are however researching the different libraries that can be used to carry out the actual payments. This involves using the [Interledger's](https://interledger.org/) [STREAM protocol](https://interledger.org/rfcs/0029-stream/) and finding supported libraries. This last task has proven to be difficult, as all browser JS/TS plugin libraries that are responsible for settling payments on different networks (eg. paypal, ripple), are still in development. We are currently exploring our options here, since so far we were not able to compile them for a browser environment (instead of a node environment). Once we get some prototype payment transactions going, we can move on to this second objective of integrating into the Solid authentication hook.

The third objective was creating a prototype monetized Solid application. This is an objective that will be saved for last, since it is easiest when all links of the full chain have been researched and implemented.

## Key activities

<!-- Please report on the key activities outlined in your original proposal.
 It's OK if some of them have evolved - simply share how and why that happened. If you have links to any outputs, either final or in-progress (e.g. mock ups, prototypes) share them here. This could include blogs, documentation, GitHub repos, tools audio-video content, etc. -->
 * Milestone 1: Application to configure a Web Monetization wallet into a Solid identity
    * Task 1.1. Extension of WebID ontology to include link to Web Monetization Wallet

        **[Status: Finished]**  
        We are of the opinion that Payment Pointers should have an extra indirection so that more properties can be attached to a single payment pointer. This would allow a user to (in the future):

         * Mark a payment pointer with a purpose/tag (eg. work, personal)
         * Mark a payment pointer as default (if there are multiples)
         * Use different types of Payment Pointers (right now we are working with an `InterledgerPaymentPointer` type)
         * Easily add any more propeties in the future if deemed necessary.
        
        Our solution initially required RDF BlankNodes to implement this. However blank nodes are still problematic when parsing and wrinting RDF, so we've opted to [skolemize](https://www.w3.org/TR/rdf11-concepts/#section-skolemization) the blank nodes. 

    * Task 1.2. Application to configure a Web Monetization wallet into a Solid identity

        **[Status: Finished]**          
        This started out as a React-Typescript project, because we wanted to reuse the [@inrupt/solid-ui-react](https://www.npmjs.com/package/@inrupt/solid-ui-react) library. This library leans on top of the [@inrupt/solid-client-authn-browser](https://www.npmjs.com/package/@inrupt/solid-client-authn-browser) library. Since however the newest features of that underlaying library weren't available yet and we needed more fine grained control, the `@inrupt/solid-ui-react` library was dropped. Because the team is very familiar with angular applications, we then quickly rewrote the application as an angular application using that lower-level `@inrupt/solid-client-authn-browser` libary.

        When the user logs in, he/she can choose between 3 identity providers: inrupt.net, solidcomminity.net and a custom identity provider (url). The latter one can (among others) be used to refer to the [Community Solid Server (CSS)](https://github.com/solid/community-server).

 * Milestone 2: Extension of the Solid authentication library with Web Monetization support
    * Task 2.1. Analysis of Solid/WebID authentication protocol
        
        **[Status: Started]**  
        Theoretical work on this task has started. Most work so far has gone into researching the OAuth extensions that Solid/WebID would require on top of the standard OIDC/OAuth 2.0 workflow since we are familiar with that flow. More specifically this meant reading up on [Proof of Posession Tokens (PoP)](https://tools.ietf.org/html/rfc7800), [Provider Selection](https://github.com/solid/webid-oidc-spec/blob/master/example-workflow.md#21-provider-selection), [WebID URI derivation](https://github.com/solid/webid-oidc-spec#deriving-webid-uri-from-id-token), [Provider Confirmation](https://github.com/solid/webid-oidc-spec#authorized-oidc-issuer-discovery).

        More work needs to be done here to thoroughly grasp the workflow, before integrating it into the Solid authentication hooks.

    * Task 2.2. Analysis of Web Monetization protocol

        **[Status: Ongoing]**  
        This task is ongoing. It involves reading the [Web Monetization Specification](https://webmonetization.org/specification.html) and theorizing about web monetization use cases and how to practically surface some decisions to the user (eg. picking a payment pointer, setting a payment limit, etc).
    
    * Task 2.3. Theoretical integration of WebID and Web Monetization protocols

        **[Status: Not started]**

* *All following tasks and milestones have not been started yet*


## Communications and marketing

<!-- How have you discussed your work in public? Please include any links to writing, interviews, podcasts, webinars, tutorials etc. If you included marketing in your budget, provide examples of how those funds were spent. -->
N/a


## What’s next?

<!-- For Progress reports: What will you do during the remainder of your funded grant period? What is still left to accomplish on your timeline?   For Final reports, let us know where you’ll take your work next? -->
The next milestone is of course Milestone 2. Once we have a deep enough insight into the protocols and specifications we can start the theoretical integration of the WebID and Web Monetization protocols (Task 2.3) and follow it up with the implementation. This would then immediatly get us started on Milestone 3 and its tasks.

## What community support would benefit your project?

<!-- Please let readers  know if there are ways we can help problem-solve, advance your work or make connections. -->
N/a

## Additional comments

<!-- Is there something that we haven’t asked you would like to share? -->
N/a

## Relevant links/resources  (optional)
N/a