# Incentivizing Decentralized Application Development within Solid through Web Monetization

The **Solid decentralization effort** decouples data from services, so that users are in full control over their personal data.
Since services can not primarily depend on data collection as a primary business model anymore, alternative forms of monetization,
such as **micropayments via Web Monetization** are essential for **incentivizing application development**.

This project is funded by [Grant for the Web](https://www.grantfortheweb.org/),
and runs from May 2021 for 6 months until (and including) October 2021.
All progress will happen publicly via this repository.

## Goals

1. **Enable monetization of Solid applications**: Solid applications will be able to include a payment pointer that can be discovered and used by the Solid authentication logic or by user agents. This involves the creation of a prototype monetized Solid application.
2. **Allow Solid identities to be linked to Web Monetization wallets**: Solid users will optionally be able to configure a Web Monetization wallet that will be used to perform payments when they log into and use monetized Solid applications. This involves the development of a user configuration application in which Solid users can link a Web Monetization wallet to their identity.
3. **Incorporate payment processing into Solid’s authentication**: Once a user has logged into an monetized Solid application, payments will be performed from the user’s wallet as long as the application is being used. This involves developing an extension of the Solid authentication library that implements the Web Monetization protocol.

## Intended outcomes

1. Application to configure a Web Monetization wallet into a Solid identity
2. Extension of the Solid authentication library with Web Monetization support
3. Prototypical Web Monetized Solid application
4. Documentation and tutorials for Solid users to configure a Web Monetization wallet
5. Documentation and tutorials for application developers to monetize their application
6. Dissemination of the main results and findings of this project

## Public reports

* [Final report](https://community.webmonetization.org/rubensworks/incentivizing-decentralized-application-development-within-solid-through-web-monetization-grant-report-2-4blb)
* [Interim report](https://community.webmonetization.org/rubensworks/incentivizing-decentralized-application-development-within-solid-through-web-monetization-grant-report-1-4i35)

## Outcomes

### 1: Solid Accountant

Application to configure a Web Monetization wallet into a Solid identity.

* [Demo](https://wallet.solid-wm.discover.ilabt.imec.be/)
* [Documentation](https://knowledgeonwebscale.github.io/solid-web-monetization/accountant/)
* [Source code](https://github.com/KNowledgeOnWebScale/solid-web-monetization/tree/master/solid-accountant)

### 2: Web Monetization in Solid

Alignment of Solid and Web Monetization.

* [Specification](https://knowledgeonwebscale.github.io/solid-web-monetization/spec.html)
* [Source code of Solid library with Web Monetization support](https://github.com/KNowledgeOnWebScale/solid-wmp-client)
* [Demo](https://wmp.solid-wm.discover.ilabt.imec.be/about)

### 3: Solid MicroStore

Prototypical Web Monetized Solid application.

* [Demo](https://store.solid-wm.discover.ilabt.imec.be/)
* [Documentation](https://knowledgeonwebscale.github.io/solid-web-monetization/microstore/)
* [Source code](https://github.com/KNowledgeOnWebScale/solid-web-monetization/tree/master/solid-microstore)

### 4: Published paper

* Solid Web Monetization [[publication]](https://link.springer.com/chapter/10.1007/978-3-031-09917-5_40) [[preprint pdf]](https://github.com/KNowledgeOnWebScale/solid-web-monetization/raw/master/Solid_Web_Monetization.pdf)
