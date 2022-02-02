# Solid Microstore - Practical

## Purpose

The purpose of this application is to demonstrate being a content creator that wants to monetize its content. This is done by including a simple HTML meta tag on the page. This tag can be present in the static HTML file or it can be added dynamically after the page has loaded.

In this example it will be added dynamically. This meta tag will contain the payment pointer of the content owner. It will allow for visitors to know where to send micropayments to.

!!! important
    In theory this would be all that is required. For now however some javascript code has to be included on the page too. This code is mainly encapsulated in the [Web Monetization Provider Client library](/solid-web-monetization/wmp/client). In the future however it could be integrated in the Solid authentication process, which in turn could even be handled by the visiting user's browser agent by means of an extension.

## Usage

To use this application you simply browse the two example use case pages. You will see that without being logged in to your Solid WebID, the monetized content will not be shown/unlocked.

Once you are logged in, you will be able to view all the content.

### Docker
The Microstore application can be started via Docker Compose:

1. Clone the repository: `git clone https://github.com/KNowledgeOnWebScale/solid-web-monetization`
2. Open the root repository folder, where the `docker-compose.yml` file is located: `cd solid-web-monetization`
3. Execute `docker-compose up -d`
4. Browse to http://store.localhost

### Environment variables

Under the `store.environment` section in the `docker-compose.yml` file, you can set the following environment variables.

name                      | default          | description
--------------------------|------------------|----------------
PAYMENT_POINTER           | `$$rafiki.money/p/thomas.dupont@ugent.be` | This is the payment pointer of the content creater/owner. _(Double `$$` is needed to escape the single `$`)_
CONFIG_VARS               | `PAYMENT_POINTER`  | **Don't change this!** This is needed to setup the PAYMENT_POINTER variable in the microstore application.
CONFIG_FILE_PATH          | `/app/assets`      | **Don't change this!** This is needed to setup the PAYMENT_POINTER variable in the microstore application.
CONFIG_FILE_NAME          | `config.json`      | **Don't change this!** This is needed to setup the PAYMENT_POINTER variable in the microstore application.

### Login

Although in theory it should not matter which Solid pod and thus Solid WebID you use, this demonstrator has been hardwired to authenticate with *solidcommunity.net*. So you will need an account and pod there. 

That is why you should create a solid pod over at [solidcommunity.net](https://solidcommunity.net/register), if you did not so already. 

### Paywall page

This page demonstrates the typical use case of a paywall. Without paying, you cannot view anything on the page, since it is locked behind a paywall. 

Once logged in, the Web Monetization Provider URL will be read from the WebID of the user. The [solid-wmp-client library](/solid-web-monetization/wmp/client) can than be used to initiate micropayments to the payment pointer of the content creator.


!!! warning
    In this case the content is hidden in client-side code. This means that with some DOM manipulation you can still see the content. It is only meant for demonstration purposes though. If you would do this properly, you should only load the actual content from the server, once payments arrive.

![](../../assets/img/microstore_paywall.png)

### Mixed content page

This page demonstrates a use case where normal content is interleaved with premium content. Without logging in, you will see that the premium content has locked banners on top of it, once logged in and payment started through the [solid-wmp-client library](/solid-web-monetization/wmp/client), the banners are removed and the premium content is viewable.

!!! info
    This use case is equivalent to a use case where advertisement banners in between content, can be removed once payment has started.

![](../../assets/img/microstore_mixed.png)

### Counter

On the top right of the application is the counter. This acts as a visualization of the messaging once the payment is set up. Messages are being sent over a websocket from the WMP back to the client. This counter shows state or transferred funds.

![](../../assets/img/counter.png)

### Meta tag

The meta tag that contains the content creator's payment pointer is described in the [Web Monetization Specification Draft](https://webmonetization.org/specification.html#meta-tags-set).

As with any meta tag, it should be in the header section of the HTML page.

```html
<!-- Example meta tag -->
<meta name="monetization" content="$wallet.example.com/alice">
```



--8<-- "includes/abbreviations.md"