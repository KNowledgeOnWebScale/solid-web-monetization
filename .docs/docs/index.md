# Solid Web Monetization

The **Solid decentralization effort** decouples data from services, so that users are in full control over their personal data.
Since services can not primarily depend on data collection as a primary business model anymore, alternative forms of monetization,
such as **micropayments via Web Monetization** are essential for **incentivizing application development**.

This project is funded by [Grant for the Web](https://www.grantfortheweb.org/),
and runs from May 2021 for 6 months until (and including) October 2021.
All progress will happen publicly via this repository.

_The project was extended until (and including) January 2022._

## Goals

1. **Enable monetization of Solid applications**: Solid applications will be able to include a payment pointer that can be discovered and used by the Solid authentication logic or by user agents. This involves the creation of a prototype monetized Solid application.
2. **Allow Solid identities to be linked to Web Monetization wallets**: Solid users will optionally be able to configure a Web Monetization wallet that will be used to perform payments when they log into and use monetized Solid applications. This involves the development of a user configuration application in which Solid users can link a Web Monetization wallet to their identity.
3. **Incorporate payment processing into Solid’s authentication**: Once a user has logged into an monetized Solid application, payments will be performed from the user’s wallet as long as the application is being used. This involves developing an extension of the Solid authentication library that implements the Web Monetization protocol.

## Intended outcomes

1. Application to configure a Web Monetization wallet into a Solid identity  
   [:octicons-book-16: docs](/solid-web-monetization/accountant) | [:octicons-code-square-16: code](https://github.com/KNowledgeOnWebScale/solid-web-monetization/tree/master/solid-accountant)
2. Extension of the Solid authentication library with Web Monetization support  
   [:octicons-checklist-16: spec](/solid-web-monetization/spec.html) | [:octicons-book-16: library docs](/solid-web-monetization/wmp/client) | [:octicons-code-square-16: library code](https://github.com/KNowledgeOnWebScale/solid-wmp-client)
3. Prototypical Web Monetized Solid application  
   [:octicons-book-16: docs](/solid-web-monetization/microstore) | [:octicons-code-square-16: code](https://github.com/KNowledgeOnWebScale/solid-web-monetization/tree/master/solid-microstore)
4. Documentation and tutorials for Solid users to configure a Web Monetization wallet  
   [:octicons-book-16: practical docs](/solid-web-monetization/accountant/practical) | [:octicons-book-16: technical docs](/solid-web-monetization/accountant/technical) | [:octicons-play-16: demo](/solid-web-monetization/demo/intro)
5. Documentation and tutorials for application developers to monetize their application  
   [:octicons-book-16: practical docs](/solid-web-monetization/microstore/practical) | [:octicons-book-16: technical docs](/solid-web-monetization/microstore/technical) | [:octicons-play-16: demo](/solid-web-monetization/demo/intro)
6. Dissemination of the main results and findings of this project  
   [:octicons-eye-16: dissemination](/solid-web-monetization/dissemination) 

## Public reports

* [Interim report](https://community.webmonetization.org/rubensworks/incentivizing-decentralized-application-development-within-solid-through-web-monetization-grant-report-1-4i35)
* Final report *(upcoming)*

--8<-- "includes/abbreviations.md"