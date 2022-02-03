# Demo introduction

The results of this project were defined by several [intended outcomes](/#intended-outcomes). A large contribution to these outcome manifests itself in the form of a working demonstrator. This section will act as a guide for this demo, as it consists of multiple separate components interacting to complete a scenario.

## Purpose of the demo

The demo hosts a couple of components, that come into play when a content-creator is hosting web monetized content that visiting users pay for through micropayments. These micropayments are sent over the [interledger](https://interledger.org/) network from the visting users wallet to the content creators wallet.

Aligning with Solid's vision, all required data is stored in the visiting user's Solid pod. Our demonstrator and the use of its various components is driven by the effort to further decentralize the web. The [Web Monetization Provider component](/solid-web-monetization/wmp) was introduced to further facilitate this decentralization.

This demo will allow you to log in to your personal Solid pod and register a personal [payment pointer](https://paymentpointers.org/). Afterwards you can subscribe to the [Web Monetization Provider](/solid-web-monetization/wmp), that will manage micropayments on your behalf (with the chosen [payment pointer](https://paymentpointers.org/)). The [Microstore component](/solid-web-monetization/microstore) can then be visited to showcase how (once logged in with your Solid WebID) the registered WMP can be requested from your Solid WebID and instructed to pay micropayments to the content provider's [payment pointer](https://paymentpointers.org/) embedded in the web page.

## Setup

The whole demonstrator can be set up and executed locally.

### Prerequisites

#### Docker

You will need a working docker installation. We recommend installing [Docker Desktop](https://www.docker.com/get-started). It should also include a Docker Compose install. (which installs by default with Docker Desktop).

#### Git

A basic git installation will be required, just to be able to clone the repository on your local pc.

#### Solid pod

As a limitation of this demonstrator, not all components work with just any Solid pod. It is however not a technical limitation. To successfully go through the demonstrator, the user wil have to create an account and pod at [solidcommunity.net](https://solidcommunity.net/register).

## Running

To run this setup, you just have to clone the repository locally and then execute the docker compose file from the cloned folder.

```bash
git clone https://github.com/KNowledgeOnWebScale/solid-web-monetization.git
cd solid-web-monetization
docker compose up -d
```

This will start all demo components on your pc.

Component | URL | Description
----------|-----|------------
[Accountant](/solid-web-monetization/accountant) | http://wallet.localhost | Allows you to edit your payment pointers stored in your WebID (on your Solid pod).
[Web Monetization Provider](/solid-web-monetization/wmp) | http://wmp.localhost | Allows you to register the WMP in your WebID (on your Solid pod) and setup a subscription to pay the WMP.
[Microstore](/solid-web-monetization/microstore) | http://store.localhost | Website of the content creator that has unlockable monetized content for users logged in with WebID.
Docs | http://docs.localhost | These docs are also hosted locally on your pc now.


!!! info
    If you want a more detailed explanation, you can follow the [demo scenario](/solid-web-monetization/demo/scenario).

## docker-compose.yml

The `docker-compose.yml` file that is being used has quite a few services that are worth explaining:

```yaml linenums="1"
version: '3.9'
services:

  # Docs service
  mkdocs:                                                                           
    image: squidfunk/mkdocs-material
    container_name: mkdocs
    ports:
      - 8888:8000
    volumes:
      - type: bind
        source: ./.docs
        target: /docs
    labels:
      - "traefik.enable=true"                                       # Let traefik pick this up
      - "traefik.http.routers.docs.rule=Host(`docs.localhost`)"     # Route docs.localhost
      - "traefik.http.routers.docs.entrypoints=web"

  # Accountant application
  wallet:
    image: ghcr.io/knowledgeonwebscale/solid-web-monetization/accountant:latest
    pull_policy: always
    container_name: wallet
    labels:
      - "traefik.enable=true"                                       # Let traefik pick this up
      - "traefik.http.routers.wallet.rule=Host(`wallet.localhost`)" # Route wallet.localhost
      - "traefik.http.routers.wallet.entrypoints=web"

  # Microstore application
  store:
    image: ghcr.io/knowledgeonwebscale/solid-web-monetization/microstore:latest
    pull_policy: always
    container_name: store
    labels:
      - "traefik.enable=true"                                       # Let traefik pick this up   
      - "traefik.http.routers.store.rule=Host(`store.localhost`)"   # Route store.localhost
      - "traefik.http.routers.store.entrypoints=web"
    environment:
      - "PAYMENT_POINTER=$$rafiki.money/p/thomas.dupont@ugent.be"   # Paymentpointer of content creator
      - "CONFIG_VARS=PAYMENT_POINTER"                               # Variables to expose to the app
      - "CONFIG_FILE_PATH=/app/assets"                              # Path of the config file
      - "CONFIG_FILE_NAME=config.json"                              # Name of the config file

  # Web Monetization Provider
  wmp:
    image: ghcr.io/knowledgeonwebscale/solid-web-monetization/wmp:latest
    pull_policy: always
    container_name: wmp
    expose:
      - "8080"
    labels:
      - "traefik.enable=true"                                       # Let traefik pick this up
      - "traefik.http.routers.wmp.rule=Host(`wmp.localhost`)"       # Route wmp.localhost
      - "traefik.http.routers.wmp.entrypoints=web"
    environment:
      - "BASE_URI=http://wmp.localhost"                                 # Uri to register/write in the pod
      - "MONGO_CONNECTION_STRING=mongodb://mongodb:27017"               # The database connection string
      - "CLIENT_ID=79e3648fc184f70306e4072f3a856bb1"                    # The client ID (see docs)
      - "CLIENT_SECRET=2ba10ec24a3cb231ee39781bc3882d66"                # The client secret (see docs)
  
  # Backing database for the WMP
  mongodb:
    image: mongo:4.2
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - 'mongodb_data:/data/db'
  
  # Traefik proxy (allows for ***.localhost routing of components)
  traefik:
    image: "traefik:v2.6"
    container_name: "traefik"
    command:
      # - "--log.level=DEBUG"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

volumes:
  mongodb_data:
    driver: local

```


--8<-- "includes/abbreviations.md"