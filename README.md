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

* [Interim report](https://community.webmonetization.org/rubensworks/incentivizing-decentralized-application-development-within-solid-through-web-monetization-grant-report-1-4i35)

## Solid-Accountant (Outcome 1)
The solid accountant app can be found under its respective [folder](./solid-accountant).

Public URL: https://knowledgeonwebscale.github.io/solid-web-monetization/