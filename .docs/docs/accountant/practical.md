# Practical

## Purpose

The purpose of this application is to demonstrate storing a payment pointer in the WebID of the user. This payment pointer can than be used to initiate payments to the WMP as mandated by the subscription sanctioned by the user.

## Usage

To use the application you are required to log in to a solid pod. Once authenticated with your WebID, open the subpage `Payment pointers`.

This will present you with a table that contains all stored payment pointer (read from your WebID). From here you can add or remove pointers as you see fit.

### Docker
The Microstore can be started via Docker:

1. Download the [Docker compose file](https://github.com/KNowledgeOnWebScale/solid-web-monetization/blob/master/docker-compose.yml) or clone the whole repository.
2. Open a shell and browse to the folder where the compose file is located
3. Execute `docker-compose up -d`
4. Browse to http://wallet.localhost

### Login

![Solid indentity providers](../../assets/img/acc_login.png){ align=right }

Although this application has support for different solid pod providers, the other applications only support solidcommunity.net pods.  
That is why you should create a solid pod over at [solidcommunity.net](https://solidcommunity.net/register) to carry on. 

The other supported identity providers **for this application** are:

 * [inrupt.net](https://inrupt.net)
 * custom url (self hosted on pc)


### Paymentpointers

Payment Pointers are a standardized identifier for payment accounts. In the same way that an email address provides an identifier for a mailbox in the email ecosystem a payment pointer is used by an account holder to share the details of their account with a counter-party. [[source](https://paymentpointers.org)]

Payment pointers can be resolved to a (https scheme) URL. Under that URL [Open Payments](https://openpayments.dev/) endpoints can be discovered. They allow for payments to be received or initiated to the owner of said payment pointer.

### Your WebID

A WebID is a unique identifier used to identify a specific user. An example of what a WebID could look like is: https://fulano.pod.provider/profile/card#me. To share data with a third party, a user associates sharing preferences to the WebID of that third party. [source](https://solidproject.org/faqs#what-is-a-webid)]

The content of your WebID is typically stored in [RDF](https://www.w3.org/RDF/) and thus must be written to in RDF. This is exactly what this application demonstrates. (See [technical...](/accountant/technical))

--8<-- "includes/abbreviations.md"