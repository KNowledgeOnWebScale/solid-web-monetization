# Practical


## Purpose

The purpose of this application is to demonstrate being a content creator/owner that wants to monetize its content. This is done by including a simple HTML meta tag on the page. This can be done statically or dynamically added after the page has loaded.

In this example it will be added dynamically. This meta tag will contain the payment pointer of the content owner. It will allow for visitors to know where to send micropayments to.

## Usage

To use this application you simply browse the two example use case pages. You will see that without being logged in to your Solid WebID, the monetized content will not be shown/unlocked.

Once you are logged in, you will be able to view all the content.

### Login

Although in theory it should not matter which Solid pod and thus Solid WebID you use, this demonstrator has been hardwired to authenticate with solidcommunity.net. So you will need an account and pod there. 

That is why you should create a solid pod over at [solidcommunity.net](https://solidcommunity.net/register) if you did not so already. 

### Paywall page


This page demonstrates the typical use case of a paywall. Without paying, you cannot view anything on the page, since it is locked behind a paywall. 

Once logged in the Web Monetization Provider URL will be read from the WebID of the user. The solid-wmp-client library can than be used to initiate micropayments to the payment pointer of the content creator/owner.


!!! warning
    In this case the content is hidden in client-side code. This means that with some DOM manipulation you can still see the content. It is only meant for demonstration purposes though. If you would do this properly, you could easily only load the actual content from the server, once payments arrive.

![](/assets/img/microstore_paywall.png)

### Mixed content page

This page demonstrates a use case where normal content is interleaved with premium content. Without logging in, you will see that the premium content has locked banners on top of it, once logged in and payment started through the solid-wmp-client library, the banners are removed and the premium content is viewable.

!!! Note
    This use case is equivalent to a use case where advertisement banners can be removed from in between content, once payment has started.

![](/assets/img/microstore_mixed.png)

### Counter

On top of the application is the counter. This acts as a visualization of the messaging once the payment is set up. Messages are being sent over a websocket from the WMP back to the client. This counter shows state or transferred funds.

![](/assets/img/counter.png)

### Meta tag

The meta tag that contains the content creator/owner's payment pointer is described in the [Web Monetization Specification Draft](https://webmonetization.org/specification.html#meta-tags-set).

As with any meta tag, it should be in the header section of the HTML page.

```html
<!-- Example meta tag -->
<meta name="monetization" content="$wallet.example.com/alice">
```

