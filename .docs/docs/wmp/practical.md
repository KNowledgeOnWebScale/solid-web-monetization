# Practical

## Purpose

The purpose of this component is to provide a minimal implementation of the proposed [Solid Web Monetization provider](https://knowledgeonwebscale.github.io/solid-web-monetization/spec.html).

## Usage

### Docker
The WMP server can be started via Docker:

1. Download the [Docker compose file](https://github.com/KNowledgeOnWebScale/solid-web-monetization/blob/master/docker-compose.yml) or clone the whole repository.
2. Open a shell and browse to the folder where the compose file is located
3. Execute `docker-compose up -d`
4. Browse to http://wmp.localhost

### Environment variables

Under the `wmp.environment` section in the `docker-compose.yml` file, you can set the following environment variables.

name                      | default          | description
--------------------------|------------------|----------------
HTTP_PORT                 | HTTP port server is hosted on | `8080`,
BASE_URI                  | URI as written in WebID Solid profile document | `"http://localhost:$httpPort"`
MONGO_CONNECTION_STRING   | Connection string to mongodb instance | `"mongodb://localhost:27017"`
MONGO_DATABASE_NAME       | Database name of mongodb database | "demo-wmp"
SUBSCRIPTION_AMOUNT       | Subscription amount deducted | `5` (long)
SUBSCRIPTION_ASSET_CODE   | Subscription assetCode | `"USD"`
SUBSCRIPTION_ASSET_SCALE  | Subscription assetScale | `2` (int)
SUBSCRIPTION_INTERVAL     | Subscription deduction interval | `"P1M"`,
IDP_URI_SOLID_COMMUNITY   | solidcommunity.net IDP configuration URI | `"https://solidcommunity.net/.well-known/openid-configuration"`
CLIENT_ID **(*)**         | solidcommunity.net clientId of WMP | `"b8c75d654bfe324ccae44f1638d5310c"`
CLIENT_SECRET **(*)**     | solidcommunity.net clientSecret of WMP | `"899fb60c7f7c1b3e67abbaebcaf06904"`
REDIRECT_URI              | solidcommunity.net redirectUri of WMP | `"http://localhost:8080/auth/cb"`
REDIRECT_URI_POST_LOGOUT  | solidcommunity.net redirectUri after logout of WMP | `"http://localhost:8080/auth/logout/cb"`
API_PATH                  | Path under which API is hosted | `"/api"`
AUTH_PATH                 | Path under which auth is hosted | `"/auth"`

**(*)** The WMP must be registered to the IDP solidcommunity.net through dynamic registration. The resulting JSON contains the required `CLIENT_ID` and `CLIENT_SECRET`.

### Client registration

To register the WMP as client with solidcommunity.net execute the following statement, using the values as you set them for the environment variables.

```bash
# HTTP POST to https://solidcommunity.net/register
curl --location --request POST 'https://solidcommunity.net/register' \
--header 'Content-Type: application/json' \
--data-binary @- << EOF
{
    "client_name": "WMP",
    "application_type": "native", 
    "subject_type": "public",
    "redirect_uris": [
         "http://localhost:8080/auth/cb", 
         "http://wmp.localhost/auth/cb"
    ], 
    "post_logout_redirect_uris": [
        "http://localhost:8080/auth/logout/cb",
        "http://wmp.localhost/auth/logout/cb"
    ]
}
EOF
```

You should receive something like this:

```json hl_lines="6 7"
{
    "redirect_uris": [
        "http://localhost:8080/auth/cb",
        "http://wmp.localhost/auth/cb"
    ],
    "client_id": "******",
    "client_secret": "******",
    "response_types": [
        "code"
    ],
    "grant_types": [
        "authorization_code"
    ],
    "application_type": "native",
    "client_name": "WMP",
    "subject_type": "public",
    "id_token_signed_response_alg": "RS256",
    "token_endpoint_auth_method": "client_secret_basic",
    "post_logout_redirect_uris": [
        "http://localhost:8080/auth/logout/cb",
        "http://wmp.localhost/auth/logout/cb"
    ],
    "registration_access_token": "eyJhbGciOiJSUzI1NiJ9.eyJpc3M...IyYmEifQ.ifK5xi45...gsUJex_GfXJg",
    "registration_client_uri": "https://solidcommunity.net/register/38f951e27363209239712c5a5e6122ba",
    "client_id_issued_at": 1643387461,
    "client_secret_expires_at": 0
}
```

You can now use those `client_id` and `client_secret` values to pass as environment variables to the server. They can be edited in the [`docker-compose.yml`](#docker).

### Login

Although in theory it should not matter which Solid pod and thus Solid WebID you use, this demonstrator has been hardwired to authenticate with solidcommunity.net. So you will need an account and pod there. 

That is why you should create a solid pod over at [solidcommunity.net](https://solidcommunity.net/register) if you did not so already. 

### About page

There is nothing noteworthy about this page. Once logged in, it outputs your Solid WebID Profile URI.

### Manage page

If you do not have a subscription to this WMP yet, this page shows a form with all your available [payment pointers](https://paymentpointers.org/) found inside you WebID Profile document. If you see none yet, you have to use the [Accountant application](/accountant) first.

After selecting your preferred payment pointer and clicking `Subscribe with WebID`, your subscription is stored.

Now that you have a subscripton all details should be shown. Along with your subscription a Madate is now typically being created at your payment pointers wallet according to the [Open Payments draft specification](https://docs.openpayments.dev/api).

Now your wallet is charged according to the [environment variables](#environment-variables) set for the WMP server. This effectively funds the WMP to do paymnet on its users behalf.

### Solid

Following the Solid idea, the payment pointers are queried from the user's Solid pod and the user's WMP is stored in the user's Solid pod.


--8<-- "includes/abbreviations.md"