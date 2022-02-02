<!-- The text in these bracketed sections will not appear once you publish the post. -->

<!-- Be sure to update all text in the {brackets} that appear in the title of your post. -->

<!-- As a Grant for the Web grantee it is important that you update the community and the program on the progress of your work. This is a chance to brag a little, name where you might have struggled and get feedback from the Web Monetization Community. -->


## Image (optional)

<!-- Share a project screenshot, a whiteboard doodle, or a photo of your team hard at work. -->
![](https://knowledgeonwebscale.github.io/solid-web-monetization/assets/img/final-report-image.png)


## Project Update

<!-- Provide a short summary of how your project is going. Feel free to highlight a big win, a struggle you had or generally update us on where you are on your timeline. If this is your final report, provide a summary of how your project went during the funded period. -->

After our initial smooth progress on the application to assign payment pointers to a Solid WebID, we struggled a bit on the next part of the project. The promise beforehand was that there was ample library and documentation support out there, to be able to perform Interledger Protocol based STREAM payments, right from the user's browser to the target payment pointer of a content creator (present inside the HTML of his/her website). What we found however was that every library and example that we discoverd had several issues that could always be described as one or more of the following:

 * Libraries were written for node but not browser compatible because of internal node-specific library dependencies.
 * Documentation was outdated (but not mentioned as being outdated).
 * No pointer or link to what the correct newer libraries to use were now (since redesigns in this space seemed to happen multiple times, making older libraries obsolete but still publicly available)
 * Little to no response on dedicated slack channels 
 * Missing formal abstraction to request executing payment from a wallet, based on the payment pointer. Since any wallet could host its own auhtentication method and API for doing so, and there is no formal discovery mechanism.

This led us to request for a 3 month (time) extension for the project.

We decided to take a deeper dive at how Coil works, since they are the only party that we know of who does Web Monetization in practice. That made us realise that even Coil does execute ILP payments from a user's payment pointer to another user's paymnet pointer. Instead they offer a subscription-based service (via credit card payments) to users that can run Coil's browser extension. This extension can act like a local service (browser extensions are more priveleged than javascript executing in the browser), but as far as we known the extension also just contacts their servers to execute payments on behalf of the user. The only thing left now, is for that service to do payment from one collective wallet (Coil's wallet) to the content creators.

This inspired us to refresh our view on this problem. It lead us to propose a [Solid Web Monetization Provider specification](https://knowledgeonwebscale.github.io/solid-web-monetization/spec.html) for a component that works much like Coil's service. The key difference is that it is a Solid-based application, that stores personal data in the user's Solid Pod. The user is also free to pick any Solid Web Monetization Provider he/she wants (and thus trusts!) to subscribe to and perform ILP STREAM payments in his/her behalf.

Once we made that change, the demonstrator and specification soon followed.

## Progress on objectives

<!-- Referencing your original proposal, please update on each objective.
It's OK if some of them have evolved - simply share how and why that happened. If you have links to any outputs, either final or in-progress (e.g. mock ups, prototypes) share them here. This could include blogs, documentation, GitHub repos, tools audio-video content, etc. -->

One of our three original objectives was to be able to configure a link between a user's Solid identity and his/her wallet. This was completed during the time of our first report. Nothing has really changed here, except that deployment of the [Accountant application](https://knowledgeonwebscale.github.io/solid-web-monetization/accountant/) is no longer done on the GitHub pages. Instead we've opted for a [Docker image build](https://github.com/orgs/KNowledgeOnWebScale/packages?repo_name=solid-web-monetization), so the [whole demonstrator](https://knowledgeonwebscale.github.io/solid-web-monetization/demo/intro/) can be boostrapped by a single [`docker-compose.yml`](https://github.com/KNowledgeOnWebScale/solid-web-monetization/blob/master/docker-compose.yml) file.

A second objective was creating a prototype monetized Solid application. This objective has also been succesfully completed in the form of the [Microstore application](https://knowledgeonwebscale.github.io/solid-web-monetization/microstore/). This application is also built as a [docker image](https://github.com/orgs/KNowledgeOnWebScale/packages?repo_name=solid-web-monetization) now. The microstore app is an example application which has two use cases showing how locked/premium content can be unlocked once micropayments are started using web monetization. 

A third and last objective was tying into the Solid authentication library to trigger a check for payment pointers in the user's Solid Identity. We've updated this goal a little bit. Since the only requirement for our scripts to work, is having access to the user's public Solid WebID document, a hard tie-in at this time was not needed. We've encapsulated the required code in a [client library](https://www.npmjs.com/package/solid-wmp-client) that works alongside the [Web Monetization Provider implemenation](https://knowledgeonwebscale.github.io/solid-web-monetization/wmp/).  
In the future however it could be integrated in the Solid authentication process, which in turn could even be handled by the visiting user's browser agent by means of an extension. That would truly require nothing else than a `<meta name="monetization" content="$my.pointer">` tag from the content creator to enable micropayments.

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
        
        Our solution initially required RDF BlankNodes to implement this. However blank nodes are still problematic when parsing and writing RDF, so we've opted to [skolemize](https://www.w3.org/TR/rdf11-concepts/#section-skolemization) the blank nodes. 

    * Task 1.2. Application to configure a Web Monetization wallet into a Solid identity

        **[Status: Finished]**          
        This started out as a React-Typescript project, because we wanted to reuse the [@inrupt/solid-ui-react](https://www.npmjs.com/package/@inrupt/solid-ui-react) library. This library leans on top of the [@inrupt/solid-client-authn-browser](https://www.npmjs.com/package/@inrupt/solid-client-authn-browser) library. Since however the newest features of that underlaying library weren't available yet and we needed more fine grained control, the `@inrupt/solid-ui-react` library was dropped. Because the team is very familiar with angular applications, we then quickly rewrote the application as an angular application using that lower-level `@inrupt/solid-client-authn-browser` libary.

        When the user logs in, he/she can choose between 3 identity providers: inrupt.net, solidcomminity.net and a custom identity provider (url). The latter one can (among others) be used to refer to the [Community Solid Server (CSS)](https://github.com/solid/community-server).

 * Milestone 2: Extension of the Solid authentication library with Web Monetization support

    * Task 2.1. Analysis of Solid/WebID authentication protocol
        
      **[Status: Finished]**  
      This task involves studying [Solid OIDC](https://solid.github.io/solid-oidc/), [Solid OIDC Primer](https://solid.github.io/solid-oidc/primer/) and [DPoP tokens](https://tools.ietf.org/html/draft-ietf-oauth-dpop-04). This knowledge was used to implement the authentication flow for the [Solid Web Monetization Provider application](https://knowledgeonwebscale.github.io/solid-web-monetization/wmp/).

    * Task 2.2. Analysis of Web Monetization protocol

      **[Status: Finished]**  
      This task involves reading the [Web Monetization Specification](https://webmonetization.org/specification.html) and theorizing about web monetization use cases in a Solid context.
    
    * Task 2.3. Theoretical integration of WebID and Web Monetization protocols

      **[Status: Finished]**  
      This task manifested itself in the design of the [Solid Web Monetization Provider specification](https://knowledgeonwebscale.github.io/spec.html) that we proposed. 

    * Task 2.4. Implementation of integrated protocol

      **[Status: Finished]**  
      This task manifested itself in the proof of concept authentication implementation of the [Solid Web Monetization Provider specification](https://knowledgeonwebscale.github.io/spec.html) that we did in the form of the [Solid Web Monetization Provider application](https://knowledgeonwebscale.github.io/solid-web-monetization/wmp/).

 * Milestone 3:  Prototypical Web Monetized Solid application

    * Task 3.1. Implementation of prototypical Solid application

      **[Status: Finished]**  
      This task required the implementation of a prototypical Solid application. The result of this task is the [Microstore application](https://knowledgeonwebscale.github.io/solid-web-monetization/microstore/). This application is an example of a Web Monetized application: it has two subpages which represent a typical use case each (paywall and mixed content). Micropayments allow the visiting user to see the locked content.

    * Task 3.2. Integration testing of Web Monetization in combination with Solid authentication

      **[Status: Finished]**  
      This task has been reduced somewhat in the sense that manual tests using the prototype implementation of the [Microstore application](https://knowledgeonwebscale.github.io/solid-web-monetization/microstore/) were the main point of focus. Besides, the actual authentiation steps in the client-side application (Microstore and Accountant) were handled by the [@inrupt/solid-client-authn-browser](https://www.npmjs.com/package/@inrupt/solid-client-authn-browser) library, which is already thoroughly tested.

* Milestone 4: Documentation and tutorials

    * Task 4.1. Documentation for Solid users to configure a Web Monetization wallet

      **[Status: Finished]**  
      For this task documentation was written and publicly hosted on the Github Pages.
      
      * The [practical docs](https://knowledgeonwebscale.github.io/solid-web-monetization/accountant/practical) are meant for users, explaining how to use the [Accountant application](https://knowledgeonwebscale.github.io/solid-web-monetization/accountant).
      * The [technical docs](https://knowledgeonwebscale.github.io/solid-web-monetization/accountant/technical) are meant for developers, on how to implement an application like the [Accountant application](https://knowledgeonwebscale.github.io/solid-web-monetization/accountant).

    * Task 4.2. Documentation for application developers to monetize their application
    
      **[Status: Finished]**  
      For this task documentation was written and publicly hosted on the Github Pages.
      
      * The [practical docs](https://knowledgeonwebscale.github.io/solid-web-monetization/microstore/practical) are meant for users, explaining how to use the [Microstore application](https://knowledgeonwebscale.github.io/solid-web-monetization/microstore).
      * The [technical docs](https://knowledgeonwebscale.github.io/solid-web-monetization/microstore/technical) are meant for developers, on how to implement an application like the [Microstore application](https://knowledgeonwebscale.github.io/solid-web-monetization/microstore).

* Milestone 5: Dissemination of the main results and findings of this project

    * Task 5.1. Presentation at Web-related conferences via publications and tutorials

      **[Status: Finished]**  
      A [demonstrator](https://knowledgeonwebscale.github.io/solid-web-monetization/demo) was built and a [scenario](https://knowledgeonwebscale.github.io/solid-web-monetization/demo/scenario) was detailed to go through the demonstrator. A [demonstration paper](https://knowledgeonwebscale.github.io/solid-web-monetization/dissemination) is in the making which will be presented at a conference in the near future.

    
    * Task 5.2. Publishing prototype on the Web as a live demonstration

      **[Status: Finished]**  
      The demonstrator is publicly available at the [GitHub repository](https://github.com/KNowledgeOnWebScale/solid-web-monetization), documentation on how to get it running is hosted on the [GitHub Pages](https://knowledgeonwebscale.github.io/solid-web-monetization). It can be installed locally by anyone using Docker Compose and the [`docker-compose.yml`](https://github.com/KNowledgeOnWebScale/solid-web-monetization/blob/master/docker-compose.yml) file. The setup is documented [here](https://knowledgeonwebscale.github.io/solid-web-monetization/demo).

      The demonstrator will also be hosted online at *(url coming soon)*.


## Communications and marketing

<!-- How have you discussed your work in public? Please include any links to writing, interviews, podcasts, webinars, tutorials etc. If you included marketing in your budget, provide examples of how those funds were spent. -->

We are collaborating with other initiatives that combine Web Monetization with Solid on https://github.com/solid/webmonetization.


## What’s next?

<!-- For Progress reports: What will you do during the remainder of your funded grant period? What is still left to accomplish on your timeline?   For Final reports, let us know where you’ll take your work next? -->

The next steps would be hearing possible objections or suggestion to the [Solid Web Monetization Provider specification proposal](https://knowledgeonwebscale.github.io/solid-web-monetization/spec.html). If this specification is followed, it would allow us to hook into Solid authentication code (right after the authentication step is done). Which would make it possible to immediatly fetch the required information from the user's Solid WebID to perform micropayments on web monetization supported webpages.


## What community support would benefit your project?

<!-- Please let readers  know if there are ways we can help problem-solve, advance your work or make connections. -->

N/A


## Additional comments

<!-- Is there something that we haven’t asked you would like to share? -->

N/A


## Relevant links/resources  (optional)

### Repositories

 * Project repository: https://github.com/KNowledgeOnWebScale/solid-web-monetization/
 * Client library repository: https://github.com/KNowledgeOnWebScale/solid-wmp-client/

### Documentation

 * Project documentation: https://knowledgeonwebscale.github.io/solid-web-monetization/ 

### Library

 * Npm: https://www.npmjs.com/package/solid-wmp-client
 * Library API: https://knowledgeonwebscale.github.io/solid-wmp-client/ 

### Specification

 * https://knowledgeonwebscale.github.io/solid-web-monetization/spec.html