# Meetup Now API

This repository contains the API code for the Meetup Now app. There are separate repositories for the [app](https://github.com/meetup/now-mobile) and [admin](https://github.com/meetup/now-admin).

## Installation

### Installing dependencies

1. Install [yarn](https://yarnpkg.com/en/docs/install#mac-stable).
1. Install [asdf](https://github.com/asdf-vm/asdf).
1. Install the [asdf node plugin](https://github.com/asdf-vm/asdf-nodejs).

> **NOTE:** if command asdf is not found you likely need to source your `.bash_profile` or `.zshrc`.

> **NOTE:** make sure the appropdiate version of node is running: `node -v` should return something like v8.9.4. If it doesn't, run `asdf install` to install the version specified in `.tool-versions`. 

### Setting up Postgres

_**On MacOS**_
- `brew install postgresql@9.6`
- `brew services start postgresql@9.6`
- `echo 'export PATH="/usr/local/opt/postgresql@9.6/bin:$PATH"' >> ~/.bash_profile`
- `createdb meetup_now`
- `createdb meetup_now_test`

_**On Ubuntu**_
- `sudo apt install postgres`
- `sudo -u postgres -i`
  - `createuser YOUR_USER_ID`
  - `createdb meetup_now`
  - `createdb meetup_now_test`
  - `psql`
    - `GRANT ALL ON DATABASE meetup_now to YOUR_USER_ID`
    - `GRANT ALL ON DATABASE meetup_now_test to YOUR_USER_ID`

### Running migrations

- `yarn migrate:test`
- `yarn migrate:development`

## Usage

### Running the API

- `yarn build`
- `yarn server`

The API is now running at http://localhost:3000/graphiql

### Connecting to the API from a device

If you want to build the [Meetup Now app](https://github.com/meetup/now-mobile/blob/master/README.md#usage) and have it connect to the API you are running locally, simply modify the `.env` file in the `meetup-now` directory: 

```
# Replace these:
#NOW_API_URL=https://now.meetup.com/graphql
#NOW_WS_URL=wss://now.meetup.com/subscriptions
# With these:
NOW_API_URL=http://localhost:3000/graphql
NOW_WS_URL=wss://localhost:3000/subscriptions
```

> **BEWARE: gradle keeps a build cache.** If you change your `.env` file you need to `cd /android` and `./gradlew clean` before you run `yarn android` or changes wont be picked up.

> **BEWARE: AVDs are virtual machines.** To target an API running on your local machine you need to handle port forwarding: `adb reverse tcp:3000 tcp:3000`.

### Deploying

Deployments are handled by travis via `bin/deploy.sh`
