# SOLID Accountant

The solid accountant app can be found under its respective [folder](./solid-accountant).

Public URL: https://knowledgeonwebscale.github.io/solid-web-monetization/wallet

## Introduction
This is an example application that allows a users to store a payment pointer inside it's SOLID WebID.

## Usage
To use the application you first need a SOLID pod, you can host one of your own using the [Community Solid Server]() or create one over at a third party provider like [inrupt.net](https://signup.pod.inrupt.com/) or [solidcommunity.net](https://solidcommunity.net/).

Once you have pod there, it will also create a WebID identifier inside it for you. You can now login to your pod provider that acts as an identity provider.

The form that is hosted in the application will allow you to add a tuple that associates a `hasPaymentPointer` relation with your WebID.

Once saved, everything is in place to visit web-monetized websites an (micro)pay them with your WebID associated payment pointer.

## Local setup
You can setup these components locally on your pc. You will require the following components:

 * Working docker installation
 * yarn package manager installed

Now do the following:

 * Clone the root folder of this repository
 * In the root directory run `docker compose up -d`
 * In the `solid-accountant` folder run `yarn start`
 * In the `solid-microstore` folder run `yarn start`

Both applications are available at:

 * http://localhost:4200/solid-web-monetization/wallet
 * http://localhost:4200/solid-web-monetization/store